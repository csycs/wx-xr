/**
 * 本地素材配置
 *
 * 使用说明：
 * 1. 将图片放在 src/assets/images/ 目录下
 * 2. 将 3D 模型放在 src/assets/models/ 目录下（支持 .glb, .gltf 格式）
 * 3. 将视频放在 src/assets/videos/ 目录下（支持 .mp4 格式）
 * 4. 在此文件中配置素材信息
 *
 * 注意：在小程序中需要使用 require() 导入本地资源
 */

// 导入本地测试资源
const testImage = require("@/assets/images/target-1.jpg");
const testVideo = require("@/assets/videos/video-1.mp4");

// 本地测试素材配置
export const LOCAL_MATERIALS_CONFIG = [
  // 示例视频素材
  // {
  //   id: 'local-video-1',
  //   name: '测试视频素材',
  //   type: 'video',
  //   imageUrl: testImage,
  //   videoUrl: testVideo,
  //   isLocal: true,
  //   createdAt: Date.now()
  // }
  // 添加更多本地素材
  {
    id: "local-model-1",
    name: "3D 模型示例",
    type: "model",
    imageUrl: testImage,
    modelUrl: "https://www.shuzirenmodel.com/ar/aota/miku.glb",
    isLocal: true,
    createdAt: Date.now(),
  },
];

/**
 * 获取本地素材列表
 */
export function getLocalMaterials() {
  return LOCAL_MATERIALS_CONFIG;
}

/**
 * 根据 ID 获取本地素材
 */
export function getLocalMaterialById(id) {
  return LOCAL_MATERIALS_CONFIG.find(m => m.id === id);
}
