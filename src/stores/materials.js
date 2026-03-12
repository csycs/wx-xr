import Taro from '@tarojs/taro'
import { defineStore } from 'pinia'
import { LOCAL_MATERIALS_CONFIG } from '@/config/local-materials'

// 本地素材数据（从配置文件读取）
export const LOCAL_MATERIALS = LOCAL_MATERIALS_CONFIG

const STORAGE_KEY = 'ar_materials'

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    materials: [],
    currentScanMaterial: null
  }),

  getters: {
    // 获取所有素材（包括本地素材）
    allMaterials() {
      return [...LOCAL_MATERIALS, ...this.materials]
    },

    // 按类型获取素材
    getMaterialsByType: (state) => (type) => {
      return state.allMaterials.filter(m => m.type === type)
    },

    // 获取素材总数
    totalCount() {
      return this.allMaterials.length
    }
  },

  actions: {
    // 从本地存储加载素材
    loadFromStorage() {
      try {
        const data = Taro.getStorageSync(STORAGE_KEY)
        if (data) {
          this.materials = JSON.parse(data)
        }
      } catch (error) {
        console.error('加载素材数据失败:', error)
      }
    },

    // 保存到本地存储
    saveToStorage() {
      try {
        Taro.setStorageSync(STORAGE_KEY, JSON.stringify(this.materials))
      } catch (error) {
        console.error('保存素材数据失败:', error)
      }
    },

    // 添加素材
    addMaterial(material) {
      const newMaterial = {
        ...material,
        id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now()
      }
      this.materials.push(newMaterial)
      this.saveToStorage()
      return newMaterial
    },

    // 删除素材
    deleteMaterial(id) {
      const index = this.materials.findIndex(m => m.id === id)
      if (index > -1) {
        this.materials.splice(index, 1)
        this.saveToStorage()
        return true
      }
      return false
    },

    // 根据ID获取素材
    getMaterialById(id) {
      return this.allMaterials.find(m => m.id === id)
    },

    // 设置当前扫描的素材
    setCurrentScanMaterial(material) {
      this.currentScanMaterial = material
    }
  }
})
