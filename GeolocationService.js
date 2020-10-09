import BackgroundGeolocation from 'react-native-background-geolocation';

export async function geoLocationListener() {
  BackgroundGeolocation.reset();
  BackgroundGeolocation.stop();

  let geofencesData = [
    {
      notifyOnExit: true,
      radius: 200,
      identifier: '123456789',
      latitude: 45.76963,
      longitude: 4.869603,
      notifyOnEntry: true,
      notifyOnDwell: true,
      geofenceModeHighAccuracy: true,
      extras: {
        name: 'name',
      },
    },
  ];
  let lastGeofenceEvent = {};

  BackgroundGeolocation.addGeofences(geofencesData)
    .then((success) => {
      console.log('[addGeofence] success', success);
    })
    .catch((error) => {
      console.log('[addGeofence] FAILURE: ', error);
    });

  // Listen to geofence events.
  BackgroundGeolocation.onGeofence((event) => {
    console.log('[LOCATION][onGeofence] -  ', event);
    lastGeofenceEvent = event;
  });

  BackgroundGeolocation.onLocation((location) => {
    console.log('LOCATION', location.coords);
  });

  // connect to demo server.
  let DemoToken = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(
    'LeclercMaStation',
    'Valentin',
  );

  BackgroundGeolocation.onHttp((httpEvent) => {
    console.log(
      'GEOLOCATION API ANSWER',
      httpEvent.success,
      httpEvent.status,
      httpEvent,
    );
  });

  BackgroundGeolocation.onAuthorization((event) => {
    if (event.success) {
      geoLocationListener();
    }
  });

  BackgroundGeolocation.onProviderChange((event) => {
    //status 0 == not determined
    //status 1 == restricted
    //status 2 == denied
    //status 3 == always
    //status 4 == when in use
    if (event.status !== 3) {
      BackgroundGeolocation.requestPermission();
    }
  });

  BackgroundGeolocation.onHeartbeat((heartbeatEvent) => {
    BackgroundGeolocation.changePace(true);
    console.log('[heartbeat] ', heartbeatEvent);
  });

  await BackgroundGeolocation.ready(
    {
      // transistorAuthorizationToken: DemoToken, // <-- to send datas to transistor demo server
      heartbeatInterval: 60,
      stopTimeout: 60,
      reset: true, // <-- true to always apply the supplied config
      enableHeadless: true,
      foregroundService: true,
      isMoving: true,
      stopOnStationary: false,
      preventSuspend: true,
      showsBackgroundLocationIndicator: false,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,

      //Disable the plugin requesting "Motion & Fitness" (ios) or "Physical Activity" (android >= 10) authorization from the User.
      disableMotionActivityUpdates: true,

      debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,

      stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.

      //Android
      notification: {
        channelName: 'eleclerc',
        priority: 2,
      },
      locationsOrderDirection: 'DESC',
      url: 'https://test',
      httpRootProperty: '.',
      geofenceTemplate:
        '{ "operationName":"Geolocalise", "variables": { "action": "<%= geofence.action %>", "stationId": "<%= geofence.identifier %>" }, "query": "mutation Geolocalise($action: String!, $stationId: String!) { geolocalise(action: $action, stationId: $stationId) { status }}" }',

      batchSync: false, // <-- Set true to sync locations to server in a single HTTP request.
      autoSync: true, // <-- Set true to sync each location to server as it arrives.
      headers: {
        // <-- Optional HTTP headers
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      // locationAuthorizationAlert: {
      //   titleWhenNotEnabled: AppStrings.geolocation.titles.notEnabled,
      //   titleWhenOff: AppStrings.geolocation.titles.whenOff,
      //   instructions: AppStrings.geolocation.instructions,
      //   cancelButton: AppStrings.geolocation.buttons.cancel,
      //   settingsButton: AppStrings.geolocation.buttons.settings,
      // },
      persistMode: BackgroundGeolocation.PERSIST_MODE_GEOFENCE,
      maxRecordsToPersist: 1,
      locationAuthorizationRequest: 'Always',
    },
    BackgroundGeolocation.start(),
    // async state => {
    //   BackgroundGeolocation.startGeofences()
    //     .then(res => {
    //       console.log('[location] -geofences Start success', res);
    //     })
    //     .catch(e => console.log('[location] -geofences Start ERROR', e));
    // },
  );
}

export default {
  geoLocationListener,
};
