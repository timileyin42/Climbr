import Flutter
import GoogleSignIn
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    configureGoogleSignIn()
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)

    let channel = FlutterMethodChannel(
      name: "com.climbr/google_signin",
      binaryMessenger: engineBridge.applicationRegistrar.messenger()
    )
    channel.setMethodCallHandler { [weak self] (call: FlutterMethodCall, result: @escaping FlutterResult) in
      guard call.method == "signIn" else { result(FlutterMethodNotImplemented); return }
      self?.handleGoogleSignIn(result: result)
    }
  }

  // ── Google Sign-In configuration ───────────────────────────────────────────

  private func configureGoogleSignIn() {
    guard
      let path     = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
      let plist    = NSDictionary(contentsOfFile: path),
      let clientID = plist["CLIENT_ID"] as? String
    else { return }
    GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
  }

  // ── Sign-in handler ────────────────────────────────────────────────────────
  // FlutterResult MUST always be called on the main thread.
  // GIDSignIn completion blocks can fire on background threads → we dispatch back.

  private func handleGoogleSignIn(result: @escaping FlutterResult) {
    if GIDSignIn.sharedInstance.configuration == nil { configureGoogleSignIn() }

    guard GIDSignIn.sharedInstance.configuration != nil else {
      result(FlutterError(code: "GOOGLE_CONFIG_MISSING",
                          message: "GoogleService-Info.plist is missing or has no CLIENT_ID",
                          details: nil))
      return
    }

    // Try silent restore first — if the user already signed in before, this
    // completes instantly without showing any UI (the native-picker feel the
    // user asked for after first sign-in).
    GIDSignIn.sharedInstance.restorePreviousSignIn { [weak self] user, _ in
      if let user = user {
        // Already signed in — refresh tokens and return immediately (no UI shown)
        self?.extractAndReturnTokens(from: user, result: result)
        return
      }
      // No previous session — show the account picker / web OAuth
      DispatchQueue.main.async { [weak self] in
        self?.presentSignInUI(result: result)
      }
    }
  }

  private func presentSignInUI(result: @escaping FlutterResult) {
    // Find the foreground window's root VC via UIWindowScene (iOS 15+ correct API)
    guard
      let windowScene = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .first(where: { $0.activationState == .foregroundActive }),
      let rootVC = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController
               ?? windowScene.windows.first?.rootViewController
    else {
      result(FlutterError(code: "NO_VIEW_CONTROLLER",
                          message: "Could not find a presenting view controller",
                          details: nil))
      return
    }

    GIDSignIn.sharedInstance.signIn(withPresenting: rootVC) { [weak self] signInResult, error in
      DispatchQueue.main.async {
        if let error = error {
          let nsError = error as NSError
          // GIDSignInError.canceled = user tapped Cancel — treat as nil (no crash)
          if nsError.code == -5 /* GIDSignInErrorCodeCanceled */ {
            result(nil)
          } else {
            result(FlutterError(code: "SIGN_IN_FAILED",
                                message: error.localizedDescription,
                                details: nil))
          }
          return
        }
        guard let user = signInResult?.user else {
          result(FlutterError(code: "NO_USER", message: "Sign-in returned no user", details: nil))
          return
        }
        self?.extractAndReturnTokens(from: user, result: result)
      }
    }
  }

  private func extractAndReturnTokens(from user: GIDGoogleUser, result: @escaping FlutterResult) {
    user.refreshTokensIfNeeded { refreshedUser, error in
      // Always dispatch to main before calling FlutterResult
      DispatchQueue.main.async {
        if let error = error {
          result(FlutterError(code: "TOKEN_REFRESH_FAILED",
                              message: error.localizedDescription,
                              details: nil))
          return
        }
        let active = refreshedUser ?? user
        guard let idToken = active.idToken?.tokenString else {
          result(FlutterError(code: "NO_ID_TOKEN",
                              message: "Google returned no ID token",
                              details: nil))
          return
        }
        result(["idToken": idToken, "accessToken": active.accessToken.tokenString])
      }
    }
  }

  // ── OAuth redirect URL handler ─────────────────────────────────────────────

  override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return GIDSignIn.sharedInstance.handle(url)
  }
}
