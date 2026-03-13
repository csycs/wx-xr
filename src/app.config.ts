export default {
  pages: [
    'pages/home-simple/index',
    'pages/materials-simple/index',
    'pages/scan/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'AR 扫描识别',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F0F0F0'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home-simple/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/materials-simple/index',
        text: '素材',
        iconPath: 'assets/icons/materials.png',
        selectedIconPath: 'assets/icons/materials-active.png'
      }
    ]
  },
  permission: {
    'scope.camera': {
      desc: '需要使用摄像头进行AR扫描识别'
    }
  }
}
