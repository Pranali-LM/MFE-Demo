/* eslint-disable @typescript-eslint/member-ordering */
import { environment } from '@env/environment';

export class API {
  public static LEGACY_API_SERVER_URL = environment.legacy_api_server_url;
  public static INTERMEDIATE_SERVER_URL = environment.intermediate_server_url;
  public static VERSION = '/v3';
  public static PATH = `/api${API.VERSION}`;

  // Analytics
  public static GET_FLEET_STATS = `${API.INTERMEDIATE_SERVER_URL}/v2/fleet-stats`;
  public static GET_DRIVER_LIST = `${API.INTERMEDIATE_SERVER_URL}/driverslist`;
  public static GET_EVENT_FREQUENCY = `${API.INTERMEDIATE_SERVER_URL}/eventfrequency`;

  public static GET_FLEET_EVENT_TREND = `${API.INTERMEDIATE_SERVER_URL}/v2/fleet-event-trend`;
  public static GET_DRIVER_EVENT_TREND = `${API.INTERMEDIATE_SERVER_URL}/v2/driver-event-trend`;

  public static GET_VIOLATIONS = `${API.INTERMEDIATE_SERVER_URL}/violations`;
  public static GET_ASSET_VIOLATIONS = `${API.INTERMEDIATE_SERVER_URL}/asset-violations`;
  public static GET_SEVERE_VIOLATIONS = `${API.INTERMEDIATE_SERVER_URL}/recommended-events`;
  public static REQUESTED_VIDEOS = `${API.INTERMEDIATE_SERVER_URL}/create-rate-limited-request`;

  // Authenticate
  public static INTERMEDIATE_SERVER_LOGIN = `${API.INTERMEDIATE_SERVER_URL}/authenticate/fleetmanager`;
  public static INTERMEDIATE_SERVER_MASTER_LOGIN_AS = `${API.INTERMEDIATE_SERVER_URL}/authenticate/master`;
  public static INTERMEDIATE_SERVER_ADMIN_LOGIN_AS = `${API.INTERMEDIATE_SERVER_URL}/authenticate/admin`;
  public static AUTHENTICATE_SSO_USER = (tspName: string) => `${API.INTERMEDIATE_SERVER_URL}/authenticate-sso-user/${tspName}`;
  public static AUTHENTICATE_GEOTAB_USER = (tspName: string) => `${API.INTERMEDIATE_SERVER_URL}/authenticate-geotab/${tspName}`;
  public static AUTHENTICATE_RSA_SSO_USER = (tspName: string) => `${API.INTERMEDIATE_SERVER_URL}/authenticate-rsa-sso-user/${tspName}`;
  public static EULA_CONSENT = `${API.INTERMEDIATE_SERVER_URL}/eula-consent`;

  // AWS Congnito endpoints
  public static oauth2Authorization = (domain: string) => `${domain}/oauth2/authorize`;
  public static oauth2Logout = (domain: string) => `${domain}/logout`;

  // Driver Detail
  public static GET_TRIP_LIST_V2 = API.INTERMEDIATE_SERVER_URL + '/fleet-trips';

  public static GET_DRIVER_LIST_V2 = API.INTERMEDIATE_SERVER_URL + '/fleet-drivers';

  public static CREATE_DVR_REQUEST = API.INTERMEDIATE_SERVER_URL + '/create-dvr-request';
  public static CREATE_EDVR_REQUEST = API.INTERMEDIATE_SERVER_URL + '/create-edvr-request';
  public static CREATE_LOCAL_DVR_REQUEST = API.INTERMEDIATE_SERVER_URL + '/create-local-dvr-request';

  public static GET_DRIVER_STATS_V2 = API.INTERMEDIATE_SERVER_URL + '/v2/driver-stats';
  public static GET_DRIVER_TRIPS_V2 = API.INTERMEDIATE_SERVER_URL + '/driver-trips';
  public static GET_ASSET_TRIPS_V2 = API.INTERMEDIATE_SERVER_URL + '/asset-trips';
  public static GET_ASSET_STATS = API.INTERMEDIATE_SERVER_URL + '/asset-stats';
  public static GET_LATEST_TRIPS_BY_ASSET_ID = API.INTERMEDIATE_SERVER_URL + '/latest-trips-by-asset-id';
  public static GET_DRIVER_DETAILS_V2 = (driverId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/driver/${driverId}`;

  // Trip Detail
  public static TRIP_DETAILS = `${API.INTERMEDIATE_SERVER_URL}/trip-details`;
  public static EVENT_DETAILS = `${API.INTERMEDIATE_SERVER_URL}/event-details`;
  public static UPDATE_TRIP = `${API.INTERMEDIATE_SERVER_URL}/update-trip`;
  public static UPDATE_TAGS_TO_TRIP = (tripId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/trips/${tripId}/tags`;

  public static GET_BUCKET_CONTENT = API.LEGACY_API_SERVER_URL + '/api/v5/lm' + '/GetBucketContent';

  // Get security questions API
  public static SECURITY_QUESTIONS = API.LEGACY_API_SERVER_URL + '/api/security-questions';
  public static SECURITY_QUESTIONS_FOR_A_USER = API.LEGACY_API_SERVER_URL + '/api/security-questions/';

  // Validate security answers API
  public static VALIDATE_ANSWERS = API.LEGACY_API_SERVER_URL + '/api/security-questions/validate-answers';

  // Asset configuration
  public static GET_FLEET_CONFIGURATION = API.INTERMEDIATE_SERVER_URL + '/configuration';
  public static GET_ASSET_CONFIGURATION = API.INTERMEDIATE_SERVER_URL + '/get-asset-configuration';
  public static GET_FLEET_CUSTOM_EVENT_CONFIGURATION = API.INTERMEDIATE_SERVER_URL + '/custom-events';
  public static GET_FLEET_EVENTS_CUSTOM_EVENTS = API.INTERMEDIATE_SERVER_URL + '/fleet-events';

  // package config white label backend apis
  public static GET_FLEET_ASSETS = `${API.INTERMEDIATE_SERVER_URL}/assets`;
  public static PATCH_ASSET = `${API.INTERMEDIATE_SERVER_URL}/assets`;
  public static UPLOAD_ASSSETS = `${API.INTERMEDIATE_SERVER_URL}/assets`;

  // user configuration
  public static GET_UNIQUE_DRIVERS_FOR_A_USER = API.LEGACY_API_SERVER_URL + '/api/v3' + '/GetUniqueDriversForaUser';
  public static GET_USER_CONFIG_FOR_DRIVER = API.LEGACY_API_SERVER_URL + '/api/v3' + '/GetUserConfigForDriver';
  public static SET_USER_CONFIGURATION = API.LEGACY_API_SERVER_URL + '/api/v3' + '/SetUserConfiguration';
  public static SET_GLOBAL_USER_CONFIGURATION = API.LEGACY_API_SERVER_URL + '/api/v3' + '/SetGlobalUserConfiguration';

  public static ENROLL_DRIVER = API.INTERMEDIATE_SERVER_URL + '/driver/face-recognition/enroll';
  public static GET_DRIVER_IMAGES = API.INTERMEDIATE_SERVER_URL + '/driver/face-recognition/details';
  public static DELETE_PERSON_DETAILS = API.INTERMEDIATE_SERVER_URL + '/driver/face-recognition/delete';

  // Asset configuration
  public static UPDATE_FLEET_CONFIGURATION = `${API.INTERMEDIATE_SERVER_URL}/configuration`;
  public static UPDATE_ASSET_CONFIGURATION = `${API.INTERMEDIATE_SERVER_URL}/update-asset-configuration`;
  public static UPDATE_CUSTOM_EVENT_CONFIGURATION = `${API.INTERMEDIATE_SERVER_URL}/fleet-custom-events/bulk-update`;
  // Announcement Banner
  public static GET_ANNOUNCEMENTS = API.INTERMEDIATE_SERVER_URL + '/announcements';

  // DVR and E-DVR requests
  public static GET_DVR_REQUESTS = API.INTERMEDIATE_SERVER_URL + '/fleet-upload-requests';
  public static GET_EDVR_REQUESTS = API.INTERMEDIATE_SERVER_URL + '/fleet-edvr-requests';

  // FR feedback
  public static TRIP_FR_FEEDBACK = API.INTERMEDIATE_SERVER_URL + '/trip-fr-feedback';

  // Event Metadata
  public static UPDATE_EVENT_METADATA = API.INTERMEDIATE_SERVER_URL + '/update-event-metadata';

  // DVR Metadata
  public static UPDATE_DVR_METADATA = API.INTERMEDIATE_SERVER_URL + '/update-dvr-metadata';

  // GEO JSON - INDIA MAP
  public static GEO_JSON = 'assets/common/geojson-india.json';

  // TRANSLATE JSON
  public static TRANSLATE_JSON = [
    'assets/i18n/en.json',
    'assets/i18n/es.json',
    'assets/i18n/pt.json',
    'assets/i18n/fr.json',
    'assets/i18n/pt-br.json',
  ];

  // External Events
  public static GET_EXTERNAL_EVENTS = API.INTERMEDIATE_SERVER_URL + '/external-events';

  // Asset autocomplete
  public static ASSETS_AUTOCOMPLETE = API.INTERMEDIATE_SERVER_URL + '/autocomplete/assets';

  //Drivers Autocomplete
  public static DRIVERS_AUTOCOMPLETE = API.INTERMEDIATE_SERVER_URL + '/autocomplete/drivers';
  // DRIVER SIGNUP
  public static PROVISION_DRIVER = API.INTERMEDIATE_SERVER_URL + '/provision-driver';

  // GET REGISTERED DRIVERS
  public static GET_REGISTERED_DRIVERS = API.INTERMEDIATE_SERVER_URL + '/registered-drivers';

  // UPDATE DRIVER DETAILS
  public static UPDATE_DRIVER_DETAILS = API.INTERMEDIATE_SERVER_URL + '/update-driver';

  // RESEND DRIVER TEMP PASSWORD EMAIL
  public static RESEND_DRIVER_TEMP_PASSWORD = API.INTERMEDIATE_SERVER_URL + '/resend-driver-temp-password';

  // LIVESTREAM
  public static requestLivestream = API.INTERMEDIATE_SERVER_URL + '/live/create-stream-request';
  public static stopLivestream = API.INTERMEDIATE_SERVER_URL + '/live/stop-stream';
  public static REVIEW_LIVESTREAM = API.INTERMEDIATE_SERVER_URL + '/live/hls-session';
  public static LIVESTREAM_DETAILS = API.INTERMEDIATE_SERVER_URL + '/live/stream-details';

  // DVR DETAILS
  public static DVR_DETAILS = API.INTERMEDIATE_SERVER_URL + '/dvr-details';

  // REVERSE GEOCODE
  public static REVERSE_GEOCODE = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json`;

  // GENERATE S3 SIGNED URLS
  public static GENERATE_S3_SIGNED_URLS = API.INTERMEDIATE_SERVER_URL + '/s3-signed-urls/generate';

  // DELETE DRIVER
  public static DELETE_USER = (username: string) => API.INTERMEDIATE_SERVER_URL + `/users/${username}`;

  // DVR AVAIBILITY
  public static CHECK_DVR_AVAIBILITY = API.INTERMEDIATE_SERVER_URL + '/tsp/device-tracking-events';

  // COACHING INCIDENTS
  public static GET_COACHING_INCIDENTS = `${API.INTERMEDIATE_SERVER_URL}/coaching-events`;

  public static GET_CHALLENGED_INCIDENTS = API.INTERMEDIATE_SERVER_URL + '/challenged-events';

  public static GENERATE_SAMPLE_URLS = API.INTERMEDIATE_SERVER_URL + '/generate-sample-urls';

  // ASSETS
  public static MODIFY_DEVICE_MAPPING = `${API.INTERMEDIATE_SERVER_URL}/fleet/remap-device`;
  public static EXPORT_ASSETS = API.INTERMEDIATE_SERVER_URL + '/fleet/export-assets';
  public static MANAGE_DEVICE = (deviceId: string) => `${API.INTERMEDIATE_SERVER_URL}/manage-device/${deviceId}`;
  public static TRIGGER_DEVICE_TASK = (deviceId: string) => `${API.INTERMEDIATE_SERVER_URL}/devices/${deviceId}/tasks`;
  public static GET_DEVICE_TASK_STATUS = (deviceId: string) => `${API.INTERMEDIATE_SERVER_URL}/devices/${deviceId}/tasks`;
  public static SAMPLE_ASSET_CSV_DOWNLOAD = `${API.INTERMEDIATE_SERVER_URL}/sample-asset-csv`;
  public static BATCH_ASSET_UPDATION = `${API.INTERMEDIATE_SERVER_URL}/update-asset-csv`;
  public static ASSET_PLANS = `${API.INTERMEDIATE_SERVER_URL}/asset-plans`;
  public static DEVICE_MODEL_CONFIG = `${API.INTERMEDIATE_SERVER_URL}/device-model-config`;
  public static UPDATE_MDVR_CONFIG = `${API.INTERMEDIATE_SERVER_URL}/mdvr-config`;

  public static GET_IMPROVED_DRIVERS = API.INTERMEDIATE_SERVER_URL + '/v2/improved-drivers';

  public static GET_FLEET_DEVICE_STATS = API.INTERMEDIATE_SERVER_URL + '/fleet/device-stats';
  public static GET_ASSET_TAGS = (assetID: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/asset/${assetID}/tags`;

  // REPORTS
  public static GET_ARCHIVED_REPORTS = API.INTERMEDIATE_SERVER_URL + '/reports/archives';
  public static GET_ARCHIVED_REPORTS_AGGREGATE = API.INTERMEDIATE_SERVER_URL + '/reports/archives/aggregate';
  public static GET_FLEET_SAFETY_REPORT = API.INTERMEDIATE_SERVER_URL + '/reports/fleet-safety-report';

  public static GET_ASSET_DETAILS = API.INTERMEDIATE_SERVER_URL + '/asset-details';

  public static GET_DEVICE_DETAILS = API.INTERMEDIATE_SERVER_URL + '/device-details';

  // FAQ
  public static GET_FAQ_DETAILS = (faqId: string) => `${API.INTERMEDIATE_SERVER_URL}/faq/${faqId}`;
  public static EXPORT_TRIPS = API.INTERMEDIATE_SERVER_URL + '/fleet/export-trip-list';
  public static GET_COFIG_FAQ_DETAILS = (eventId: string) => `${API.INTERMEDIATE_SERVER_URL}/sdk-configs-faq/${eventId}`;

  public static SAMPLE_DRIVER_CSV_DOWNLOAD = `${API.INTERMEDIATE_SERVER_URL}/sample-driver-csv`;
  public static BATCH_DRIVER_ADDITION = `${API.INTERMEDIATE_SERVER_URL}/batch-provision-drivers`;

  // MFA
  public static USER_MFA_SETTINGS = API.INTERMEDIATE_SERVER_URL + '/mfa/status';
  public static MFA_ENABLE = API.INTERMEDIATE_SERVER_URL + '/mfa/enable';
  public static MFA_DISABLE = API.INTERMEDIATE_SERVER_URL + '/mfa/disable';
  public static adminDisableMFA = (email: string) => API.INTERMEDIATE_SERVER_URL + `/users/${email}/admin-disable-mfa`;

  public static CHANGE_PASSWORD = API.INTERMEDIATE_SERVER_URL + '/users/change-password';

  // User Management
  public static GET_USERS = API.INTERMEDIATE_SERVER_URL + '/users';
  public static GET_SPECIFIC_USER = (email: string) => API.INTERMEDIATE_SERVER_URL + `/users/${email}`;
  public static CREATE_USER = API.INTERMEDIATE_SERVER_URL + '/users';
  public static EXPORT_USERS = API.INTERMEDIATE_SERVER_URL + '/users/export';
  public static UPDATE_USER = (email: string) => API.INTERMEDIATE_SERVER_URL + `/users/${email}`;
  public static DELET_USER = (email: string) => API.INTERMEDIATE_SERVER_URL + `/users/${email}`;
  public static RESEND_TEMP_PASSWORD = (email: string) => API.INTERMEDIATE_SERVER_URL + `/users/${email}/resend-temp-password`;
  public static exportUsers = API.INTERMEDIATE_SERVER_URL + '/users/export';

  // User Management V2
  public static GET_USERS_V2 = API.INTERMEDIATE_SERVER_URL + '/v2/users';
  public static GET_SPECIFIC_USER_V2 = (userId: string) => API.INTERMEDIATE_SERVER_URL + `/v2/users/${userId}`;
  public static CREATE_USER_V2 = API.INTERMEDIATE_SERVER_URL + '/v2/users';
  public static UPDATE_USER_V2 = (userId: string) => API.INTERMEDIATE_SERVER_URL + `/v2/users/${userId}`;
  public static DELETE_USER_V2 = (userId: string) => API.INTERMEDIATE_SERVER_URL + `/v2/users/${userId}`;
  public static EXPORT_USERS_V2 = API.INTERMEDIATE_SERVER_URL + '/v2/users/export';

  public static GET_DRIVER_PERMISSIONS = API.INTERMEDIATE_SERVER_URL + '/driver-permission';
  public static UPDATE_DRIVER_PERMISSIONS = API.INTERMEDIATE_SERVER_URL + '/driver-permission';
  public static SAVE_DRIVER_CONFIG_CONSENT = API.INTERMEDIATE_SERVER_URL + '/driver-config-consent';
  public static GET_DRIVER_CONFIG_CONSENT = API.INTERMEDIATE_SERVER_URL + `/driver-config-consent`;

  public static GET_FLEET_DEVICES = API.INTERMEDIATE_SERVER_URL + '/fleet/devices';
  public static BATCH_DEVICE_PROVISIONING = API.INTERMEDIATE_SERVER_URL + '/batch-provision-devices';
  public static PROVISIONED_SAMPLE_CSV = API.INTERMEDIATE_SERVER_URL + '/sample-device-csv';
  public static PROVISION_DEVICE = API.INTERMEDIATE_SERVER_URL + '/provision-device';

  // Role Management
  public static GET_ALLOWED_PERMISSION_LIST = API.INTERMEDIATE_SERVER_URL + '/v2/permissions';
  public static rolesList = API.INTERMEDIATE_SERVER_URL + '/v2/roles';
  public static roleHierarchy = API.INTERMEDIATE_SERVER_URL + '/v2/role-hierarchy';
  public static roleTemplate = API.INTERMEDIATE_SERVER_URL + '/v2/role-templates';
  public static addRole = API.INTERMEDIATE_SERVER_URL + '/v2/roles';
  public static getRoleDetails = (roleId: string) => API.INTERMEDIATE_SERVER_URL + `/v2/roles/${roleId}`;
  public static updateRole = (roleId: string) => API.INTERMEDIATE_SERVER_URL + `/v2/roles/${roleId}`;
  public static deleteRole = (roleId: string) => API.INTERMEDIATE_SERVER_URL + `/v2/roles/${roleId}`;

  // Tag Management
  public static UPDATE_TAGS_FOR_EVENT = (tripId: string, eventIndex: string) =>
    `${API.INTERMEDIATE_SERVER_URL}/v2/trips/${tripId}/events/${eventIndex}/tags`;
  public static UPDATE_DRIVER_TAGS = (driverId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/driver/${driverId}`;
  public static GET_COACHING_CONFIG = `${API.INTERMEDIATE_SERVER_URL}/fleetdriver/fleet-coaching-config`;
  public static UPDATE_COACHING_CONFIG = `${API.INTERMEDIATE_SERVER_URL}/fleetdriver/fleet-coaching-config`;
  public static ADD_ATTRIBUTES = `${API.INTERMEDIATE_SERVER_URL}/v2/attributes`;
  public static DELETE_ATTRIBUTE_NAME = (attributeId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/attributes/${attributeId}`;
  public static GET_ATTRIBUTE_DETAILS = (attributeId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/attributes/${attributeId}`;
  public static DEACTIVATE_ATTRIBUTE = (attributeId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/attributes/${attributeId}`;
  public static LINK_ATTRIBUTES = `${API.INTERMEDIATE_SERVER_URL}/v2/manage-entities`;
  public static GET_ALL_TAGLIST = `${API.INTERMEDIATE_SERVER_URL}/v2/tags`;
  public static GET_UNIQUE_TAGLIST = `${API.INTERMEDIATE_SERVER_URL}/v2/unique-tags`;
  public static ADD_TAGS_TO_ATTRIBUTE = `${API.INTERMEDIATE_SERVER_URL}/v2/tags`;
  public static UPDATE_TAGS = (tagId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/tags/${tagId}`;
  public static DELETE_TAGS = (tagId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/tags/${tagId}`;
  public static GET_ENTITY_DETAILS = `${API.INTERMEDIATE_SERVER_URL}/v2/entities`;
  public static GET_ATTRIBUTES_V2 = `${API.INTERMEDIATE_SERVER_URL}/v2/attributes`;
  public static ADD_WIDGET_TICKET = API.INTERMEDIATE_SERVER_URL + '/user-feedback';
  public static GET_TAG_DETAILS = (rootTagId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/tags/${rootTagId}`;

  // coaching driver
  public static GET_COACHABLE_INCIDENTS = (driverId: string) =>
    `${API.INTERMEDIATE_SERVER_URL}/fleetdriver/coaching-session/drivers/${driverId}/events`;
  public static GET_DRIVER_DETAILS = (driverId: string) => `${API.INTERMEDIATE_SERVER_URL}/v2/driver/${driverId}`;
  public static CREATE_COACHING_SESSION = API.INTERMEDIATE_SERVER_URL + '/fleetdriver/coaching-session';
  public static LIST_COACHING_SESSION = API.INTERMEDIATE_SERVER_URL + '/fleetdriver/coaching-sessions';
  public static COACHING_RECPMMENDATIONS = API.INTERMEDIATE_SERVER_URL + '/fleetdriver/coaching-recommendations';
}
