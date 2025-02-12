const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');
const fs = require('fs');


module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [path.resolve(__dirname, "./env.json")],
    icon: path.resolve(__dirname, "smicon"),
    executableName: "SM-DentalCare", 
    // other options
},
hooks: {
  generateAssets: async () => {
    // Write the env.json file dynamically
    const envFilePath = path.resolve(__dirname, './env.json');
    const envData = {
      SECRET_KEY: 'abclacoste1.', // Replace this with your desired key
    };

    try {
      fs.writeFileSync(envFilePath, JSON.stringify(envData, null, 2)); // Write the JSON file with proper formatting
      console.log('env.json created successfully:', envFilePath);
    } catch (error) {
      console.error('Error creating env.json:', error);
      process.exit(1); // Exit the process if the file creation fails
    }
  },
},

  rebuildConfig: {},
  makers: [
    {


      
        name: "@electron-forge/maker-squirrel", // ✅ Ensure `name` is present
        config: {
          authors: "Fayçal Mebarki",
          description: "SM Dental Care",
          exe: "SM-DentalCare.exe",
          setupExe: "SM-DentalCare-Installer.exe",
          noMsi: true,
          setupIcon: path.resolve(__dirname, "smicon.ico"), // ✅ Ensure icon path is correct
          iconUrl: path.resolve(__dirname, "smicon.ico"),
          loadingGif: path.resolve(__dirname, "smicon.ico"), // Optional
        },
      
      
      ///
      // name: '@electron-forge/maker-squirrel',
      // config: {
      //   authors: "Fayçal Mebarki",
      //   description: "SM Dental Care",
      //   iconUrl: path.resolve(__dirname, "./smicon.ico"), // Windows icon
      //   setupIcon: path.resolve(__dirname, "./smicon.ico"), // Installer icon
      // },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
