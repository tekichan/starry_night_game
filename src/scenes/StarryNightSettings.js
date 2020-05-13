/**
 * Starry Night Shared Settings
 * @author  Teki Chan
 * @since   13 May 2020
 */
export const STARRY_NIGHT_SETTINGS = {
    // Moon gravity, will make Moon fall if you don't flap
    moonGravity: 400,
    // horizontal Moon speed
    moonSpeed: 125,
    // flap thrust
    birdFlapPower: 200,
    // minimum cloud height, in pixels. Affects head position
    minCloudHeight: 50,
    // distance range from next cloud, in pixels
    cloudDistance: [220, 280],
    // head range between clouds, in pixels
    cloudHead: [100, 130],
    // local storage object name
    localStorageName: 'bestFlappyScore'    
}