{ pkgs, ... }:
let
  # Re-import the original pkgs with 'allowUnfree' enabled.
  pkgs-with-unfree = import pkgs.path {
    config.allowUnfree = true;
    inherit (pkgs) system;
  };
in
{
  channel = "unstable";

  packages = [
    pkgs.nodejs_20
    pkgs-with-unfree.jdk
    pkgs-with-unfree.android-tools
  ];

  env = {
    ANDROID_HOME = "${pkgs-with-unfree.android-tools}";
    JAVA_HOME = "${pkgs-with-unfree.jdk}";
  };

  idx = {
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        # You can add commands here that run on every start
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
