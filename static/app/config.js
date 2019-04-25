angular.module('weatherstation').constant('config', {
    webcams: [
        'https://media.koin.com/nxs-kointv-media-us-east-1/weather/Cameras/Eastside_Exchange.jpg',
        // 'http://wx.koin.com/weather/images/Eastside_Exchange.jpg',
        // 'http://wx.koin.com/weather/images/Riverview_Bank.jpg',
        // 'http://cdn.tegna-media.com/kgw/weather/wellsfargo.jpg',
        // 'http://cdn.tegna-media.com/kgw/weather/rosecity.jpg',
        // 'http://w3.gorge.net/niknas/webcam.jpg',
        // 'http://wx.koin.com/weather/images/Skamania_Lodge.jpg',
        // 'https://www.fsvisimages.com/images/photos-main/CORI1_main.jpg',
        // 'https://tripcheck.com/RoadCams/cams/i84metro_pid588.jpg',
        // 'https://tripcheck.com/RoadCams/cams/fremontbridge_pid531.jpg',
        // 'https://tripcheck.com/RoadCams/cams/US30%20at%20St%20Johns%20Bridge%20Top_pid3487.JPG'
    ],
    wundergroundTokens: ['d0dba01007c9d499'],
    darkSkyKey: 'fb7530eb012c152629f2ace23921214e',
    lat: '45.5190697',
    lon: '-122.6494978',
    zip: '97214',
    routeRotation: [
        {route: '/today', time: 15},
        // {route: '/weatherRadar', time: 10},
        {route: '/webcam', time: 7},
        {route: '/forecast', time: 20},
        // {route: '/webcam', time: 7}
    ],
    clock: {name: 'Portland', timezone: 'America/Los_Angeles'}
});
