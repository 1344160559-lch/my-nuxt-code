<template>
  <div class="snippets-page">
    <div class="user-bar">
      <span v-if="user.username">当前用户：{{ user.username }}（{{ user.email }}）</span>
      <button class="logout-btn" @click="logout">退出登录</button>
    </div>
    <h2>我的代码片段</h2>
    <button @click="showAdd = true">新建片段</button>
    <input v-model="search" placeholder="搜索片段..." @input="fetchSnippets" />
    <div v-for="s in snippets" :key="s.id" class="snippet-item">
      <div class="snippet-title">{{ s.title }}</div>
      <MdPreview :id="id" :modelValue="s.content" />
      <button @click="editSnippet(s)" class="edit-btn">编辑</button>
      <button @click="deleteSnippet(s.id)" class="delete-btn">删除</button>
    </div>
    <div v-if="showAdd" class="modal-overlay">
      <div class="add-modal">
        <h3>新建代码片段</h3>
        <input v-model="addForm.title" placeholder="标题" maxlength="60" />
        <MdEditor v-model="addForm.content" placeholder="代码内容" />
        <button @click="currentSnippet.id ? saveEdit() : addSnippet()">
          {{ currentSnippet.id ? '保存修改' : '添加' }}
        </button>
        <button @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MdEditor,MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
// preview.css相比style.css少了编辑器那部分样式
import 'md-editor-v3/lib/preview.css';
const id = 'preview-only';

const router = useRouter()
const user = ref<{ username?: string, email?: string }>({})

const snippets = ref<any[]>([])
const search = ref('')
const showAdd = ref(false)
const addForm = ref({ title: '', language: '', content: '', description: '' })

const fetchSnippets = async () => {
  const userObj = JSON.parse(localStorage.getItem('user') || '{}')
  if (!userObj.id) return
  const res = await $fetch('/api/snippets/snippets', {
    params: { user_id: userObj.id, search: search.value }
  }) as any
  if (res.success) snippets.value = res.data
}

const addSnippet = async () => {
  const userObj = JSON.parse(localStorage.getItem('user') || '{}')
  const res = await $fetch('/api/snippets/snippets', {
    method: 'POST',
    body: { ...addForm.value, user_id: userObj.id }
  }) as any
  if (res.success) {
    fetchSnippets()
    close()
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user') || '{}')
  fetchSnippets()
})

const deleteSnippet = async (id: number) => {
  if (confirm('确定要删除这个代码片段吗？')) {
    try {
      const response = await $fetch('/api/snippets/snippets', {
        method: 'DELETE',
        body: { id }
      }) as any
      if (response.body.success) {
        fetchSnippets()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }
}

const currentSnippet = ref({ id: '',title: '', content: '' })

const editSnippet = (snippet:any) => {
  addForm.value = { ...snippet }
  currentSnippet.value = { ...snippet }
  showAdd.value = true
}

const saveEdit = async () => {
  if (!currentSnippet.value) return

  try {
    const data = {
      id: currentSnippet.value.id,
      title: addForm.value.title,
      content: addForm.value.content
    }
    
    const response = await $fetch('/api/snippets/snippets', {
      method: 'PUT',
      body: data
    }) as any
    if (response.body.success) {
      fetchSnippets()
      close()
    }
  } catch (error) {
    console.error('更新失败:', error)
  }
}

const close = () => {
  showAdd.value = false
  addForm.value = { title: '', language: '', content: '', description: '' }
  currentSnippet.value = { id: '',title: '', content: '' }
}
</script>

<style scoped>
.snippets-page { max-width: 800px; margin: 40px auto; }
.user-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.logout-btn { background: #e74c3c; color: #fff; border: none; border-radius: 4px; padding: 6px 16px; cursor: pointer; }
.logout-btn:hover { background: #c0392b; }
.snippet-item { border: 1px solid #eee; border-radius: 6px; margin: 16px 0; padding: 12px; background: #fafbfc; }
.snippet-title { font-weight: bold; font-size: 18px; }
.snippet-lang { color: #18c37d; font-size: 14px; margin-bottom: 6px; }
.snippet-content { background: #f4f4f4; padding: 8px; border-radius: 4px; }
.add-modal { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 24px; margin-top: 24px; }
input, textarea { display: block; width: 100%; margin-bottom: 12px; padding: 8px; border-radius: 4px; border: 1px solid #ddd; }
button { margin-right: 8px; }
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.add-modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}
</style>