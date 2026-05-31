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

    // Native Google Sign-In channel - bypasses FLTGoogleSignInPlugin's broken
    // UIApplication.keyWindow lookup in UIScene apps.
    // Finds the presenting VC via UIWindowScene (the correct iOS 15+ API).
    let channel = FlutterMethodChannel(
      name: "com.climbr/google_signin",
      binaryMessenger: engineBridge.applicationRegistrar.messenger()
    )
    channel.setMethodCallHandler { [weak self] (call: FlutterMethodCall, result: @escaping FlutterResult) in
      guard call.method == "signIn" else {
        result(FlutterMethodNotImplemented); return
      }
      self?.handleGoogleSignIn(result: result)
    }
  }

  private func configureGoogleSignIn() {
    guard
      let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
      let plist = NSDictionary(contentsOfFile: path),
      let clientID = plist["CLIENT_ID"] as? String
    else {
      return
    }

    GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
  }

  private func handleGoogleSignIn(result: @escaping FlutterResult) {
    if GIDSignIn.sharedInstance.configuration == nil {
      configureGoogleSignIn()
    }

    guard GIDSignIn.sharedInstance.configuration != nil else {
      result(FlutterError(code: "GOOGLE_CONFIG_MISSING",
                          message: "Missing GoogleService-Info.plist CLIENT_ID",
                          details: nil))
      return
    }

    // Find the foreground key window's root view controller via UIWindowScene
    guard let windowScene = UIApplication.shared.connectedScenes
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

    // Sign in with the correct presenting view controller
    GIDSignIn.sharedInstance.signIn(withPresenting: rootVC) { signInResult, error in
      if let error = error {
        result(FlutterError(code: "SIGN_IN_FAILED",
                            message: error.localizedDescription,
                            details: nil))
        return
      }
      guard let user = signInResult?.user else {
        result(FlutterError(code: "NO_USER", message: "Sign-in returned no user", details: nil))
        return
      }
      // Refresh tokens to ensure we have a valid ID token
      user.refreshTokensIfNeeded { refreshedUser, refreshError in
        if let refreshError = refreshError {
          result(FlutterError(code: "TOKEN_REFRESH_FAILED",
                              message: refreshError.localizedDescription,
                              details: nil))
          return
        }
        guard let idToken = (refreshedUser ?? user).idToken?.tokenString else {
          result(FlutterError(code: "NO_ID_TOKEN", message: "No ID token in response", details: nil))
          return
        }
        let activeUser = refreshedUser ?? user
        result([
          "idToken": idToken,
          "accessToken": activeUser.accessToken.tokenString
        ])
      }
    }
  }

  override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return GIDSignIn.sharedInstance.handle(url)
  }
}
