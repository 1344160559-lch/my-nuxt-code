<template>
  <div class="snippets-header">
    <div class="snippets-header-center">
      <h2>我的代码片段</h2>
      <div class="search-bar">
        <button @click="showAdd = true" class="add-btn">新建片段</button>
        <input id="search" class="search-input" v-model="search" placeholder="输入想要搜索的标题或内容..." @input="() => fetchSnippets(1)" />
        <div class="user-bar">
          <span v-if="user.username">{{ user.username }}</span>
          <button class="logout-btn" @click="logout">退出</button>
        </div>
      </div>
    </div>
  </div>
  <div class="snippets-page">
    <div v-for="s in snippets" :key="s.id" class="snippet-item">
      <div class="snippet-title">{{ s.title }}</div>
      <MdPreview :id="id" :modelValue="s.content" />
      <button @click="editSnippet(s)" class="edit-btn">编辑</button>
      <button @click="deleteSnippet(s.id)" class="delete-btn">删除</button>
    </div>
    <div v-if="showAdd" class="modal-overlay">
      <div class="add-modal">
        <h3>{{ currentSnippet.id ? '修改代码片段' : '新建代码片段' }}</h3>
        <input v-model="addForm.title" placeholder="标题" maxlength="60" />
        <MdEditor v-model="addForm.content" placeholder="代码内容" />
        <div class="btn-group">
          <button class="edit-btn" @click="currentSnippet.id ? saveEdit() : addSnippet()">
            {{ currentSnippet.id ? '保存修改' : '添加' }}
          </button>
          <button class="cancel-btn" @click="close">取消</button>
        </div>
      </div>
    </div>
    <div v-if="totalPages > 1" class="pagination">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
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
const addForm = ref({ title: '', content: '', description: '' })
const currentPage = ref(1)
const totalPages = ref(1)

const fetchSnippets = async (page = 1) => {
  currentPage.value = page;
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const res = await $fetch('/api/snippets/pagination', {
      method: 'POST',
      body: { page, pageSize: 10, search: search.value },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }) as any;

    if (res.success) {
      snippets.value = res.data;
      totalPages.value = Math.ceil(res.total / 10);
    } else if (res.code === 'TOKEN_EXPIRED') {
      tokenExpired();
    }
  } catch (error: any) {
    console.error('获取片段失败:', error);
    if (error.response?.status === 401) {
      tokenExpired();
    }
  }
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchSnippets(page);
};

const addSnippet = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const res = await $fetch('/api/snippets/snippets', {
      method: 'POST',
      body: { ...addForm.value },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }) as any
    
    if (res.success) {
      fetchSnippets()
      close()
    } else if (res.code === 'TOKEN_EXPIRED') {
      tokenExpired();
    }
  } catch (error:any) {
    console.error('添加片段失败:', error);
    if (error.response?.status === 401) {
      tokenExpired();
    }
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
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await $fetch('/api/snippets/snippets', {
        method: 'DELETE',
        body: { id },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }) as any
      
      if (response.body.success) {
        fetchSnippets()
      } else if (response.body.code === 'TOKEN_EXPIRED') {
        tokenExpired();
      }
    } catch (error: any) {
      console.error('删除失败:', error)
      if (error.response?.status === 401) {
        tokenExpired();
      }
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
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login');
      return;
    }
    
    const data = {
      id: currentSnippet.value.id,
      title: addForm.value.title,
      content: addForm.value.content
    }
    
    const response = await $fetch('/api/snippets/snippets', {
      method: 'PUT',
      body: data,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }) as any
    
    if (response.body.success) {
      fetchSnippets()
      close()
    } else if (response.body.code === 'TOKEN_EXPIRED') {
      tokenExpired();
    }
  } catch (error: any) {
    console.error('更新失败:', error)
    if (error.response?.status === 401) {
      tokenExpired();
    }
  }
}

const tokenExpired = ()=>{
  alert('登录已过期，请重新登录');
  logout();
}

const close = () => {
  showAdd.value = false
  addForm.value = { title: '', content: '', description: '' }
  currentSnippet.value = { id: '',title: '', content: '' }
}
</script>

<style scoped>
h2{margin: 10px 0px;}
input, textarea { display: block; width: 100%; margin-bottom: 12px; padding: 8px; border-radius: 4px; border: 1px solid #ddd; }
button { margin-right: 8px; }
.snippets-page { max-width: 800px; margin: 80px auto; }
.snippet-item { width: 100%;max-width: 776px; border: 1px solid #eee; border-radius: 6px; margin: 16px 0; padding: 12px; background: #fafbfc; }
.snippet-title { font-weight: bold; font-size: 18px; }
.snippet-lang { color: #18c37d; font-size: 14px; margin-bottom: 6px; }
.snippet-content { background: #f4f4f4; padding: 8px; border-radius: 4px; }
.snippets-header{
  position: fixed;
  padding: 5px 0px;
  top: 0px;
  left: 0px;
  width: 100%;
  box-shadow: 1px 3px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 10001;
}
.snippets-header-center{
  display: flex;
  justify-content: space-between; 
  margin: 0 auto;
  width: 950px;
}
.user-bar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.search-bar{
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 80%;
}
.search-input{
  padding: 8px;
  max-width: 406px;
  margin: 0px 10px 0px 0px;
}
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
  z-index: 10002;
}

.add-modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 1000px;
  margin-top: 24px;
}
.btn-group{
  margin-top: 10px;
}

.logout-btn, .add-btn, .edit-btn,.cancel-btn, .delete-btn, .pagination button {
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  margin: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.cancel-btn{
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.add-btn{
  background-color: rgb(240, 249, 235);
  margin: 0px 10px 0px 0px;
  font-weight: bold;
  color: #67c23a;
}
.add-btn:hover{
  background: rgb(209, 237, 196);
}

.edit-btn:hover, .delete-btn:hover, .pagination button:hover {
  background: rgb(51, 126, 204);
}

.delete-btn,.logout-btn {
  background: #f56c6c;
}

.delete-btn:hover,.logout-btn:hover {
  background: rgb(196, 86, 86);
}

.logout-btn{
  margin-right: 0px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
}

.pagination button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
</style>