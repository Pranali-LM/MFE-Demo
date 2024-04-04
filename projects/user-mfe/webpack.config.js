const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, '../../tsconfig.json'),
  [/* mapped paths to share */]);

module.exports = {
  output: {
    uniqueName: "usermfe",
    publicPath: "auto",
    scriptType: "text/javascript"
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({

        // For remotes (please adjust)
        name: "usermfe",
        filename: "remoteEntry.js",
        exposes: {
           './AppModule' :'./projects/user-mfe/src/app/app.module.ts',
           "./AppRoutingModule" : "./projects/user-mfe/src/app/app-routing.module.ts" ,
          //  './AssetConfigurationModule' : './projects/user-mfe/src/app/asset-configuration/asset-configuration.module.ts',
          //  './AssetsModule' : './projects/user-mfe/src/app/assets/assets.module.ts',
          //  './AuthenticationModule' : './projects/user-mfe/src/app/authentication/authentication.module.ts',
          //  "./CoachingModule" : './projects/user-mfe/src/app/coaching/coaching.module.ts',
          //  "./CoreModule" : './projects/user-mfe/src/app/core/core.module.ts',
          //  "./DriverManagementModule" :'./projects/user-mfe/src/app/driver-management/driver-management.module.ts',
          //  "./HomeModule" : './projects/user-mfe/src/app/home/home.module.ts',
          //  "./IframeAuthenticationModule" :'./projects/user-mfe/src/app/iframe-authentication/iframe-authentication.module.ts',
          //  './IncidentDetailsModule': './projects/user-mfe/src/app/incident-details/incident-details.module.ts',
          //  "./LiveViewModule" : './projects/user-mfe/src/app/live-view/live-view.module.ts',
          //  './RequestVideoModule' : './projects/user-mfe/src/app/request-video/request-video.module.ts',
          //  "./SharedModule" : "./projects/user-mfe/src/app/shared/shared.module.ts",
          //  "./TripDetailsModule" : "./projects/user-mfe/src/app/trip-details/trip-details.module.ts",
           "./UserManagementModule" : "./projects/user-mfe/src/app/user-management/user-management.module.ts"
               },

        // For hosts (please adjust)
        // remotes: {
        //     "hostApp": "http://localhost:4200/remoteEntry.js",

        // },

        shared: share({
          "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },

          ...sharedMappings.getDescriptors()
        })

    }),
    sharedMappings.getPlugin()
  ],
};
