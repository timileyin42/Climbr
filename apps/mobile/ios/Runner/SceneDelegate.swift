import Flutter
import UIKit

class SceneDelegate: FlutterSceneDelegate {

  override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    super.scene(scene, willConnectTo: session, options: connectionOptions)
    // Make window key and visible so UIApplication.sharedApplication.keyWindow
    // returns a non-nil window.  Plugins like google_sign_in_ios use keyWindow
    // to find the root view controller for presenting their OAuth UI.
    window?.makeKeyAndVisible()
  }
}
