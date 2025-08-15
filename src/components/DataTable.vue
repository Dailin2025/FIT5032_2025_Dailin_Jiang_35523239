<template>
  <div class="data-table-container">
    <!-- 搜索和过滤区域 -->
    <div class="table-controls mb-3">
      <div class="row">
        <div class="col-md-6">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
                    <input
          v-model="searchTerm"
          type="text"
          class="form-control search-input"
          placeholder="Search all columns..."
          @input="handleSearch"
        />
          </div>
        </div>
        <div class="col-md-6 text-end">
          <div class="table-actions">
            <button 
              class="btn btn-outline-primary me-2" 
              @click="exportData('csv')"
              title="Export as CSV"
            >
              <i class="fas fa-download me-1"></i>Export CSV
            </button>
            <button 
              class="btn btn-outline-primary" 
              @click="exportData('pdf')"
              title="Export as PDF"
            >
              <i class="fas fa-file-pdf me-1"></i>Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              @click="sortBy(column.key)"
              class="sortable-header"
              :class="{ 'sorted': sortKey === column.key }"
            >
              {{ column.label }}
              <i 
                v-if="sortKey === column.key" 
                :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
              ></i>
              <i v-else class="fas fa-sort text-muted"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in paginatedData" 
            :key="item.id"
            @click="handleRowClick(item)"
            class="table-row-clickable"
            style="cursor: pointer;"
          >
            <td v-for="column in columns" :key="column.key">
              <span v-if="column.type === 'date'">
                {{ formatDate(item[column.key]) }}
              </span>
              <span v-else-if="column.type === 'status'">
                <span :class="getStatusClass(item[column.key])">
                  {{ item[column.key] }}
                </span>
              </span>
              <span v-else-if="column.type === 'actions'">
                <slot name="actions" :item="item">
                  <!-- Default actions if no slot provided -->
                  <button 
                    v-if="canDeleteItem(item)"
                    class="btn btn-sm btn-outline-danger me-1" 
                    @click.stop="handleDelete(item)"
                    title="Delete"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button 
                    v-if="canEditItem(item)"
                    class="btn btn-sm btn-outline-primary" 
                    @click.stop="handleEdit(item)"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </slot>
              </span>
              <span v-else>
                {{ item[column.key] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控制 -->
    <div class="pagination-container">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="pagination-info">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
          </div>
        </div>
        <div class="col-md-6">
          <nav aria-label="分页导航">
            <ul class="pagination justify-content-end mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>
              
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- 每页显示数量选择 -->
    <div class="page-size-selector text-end mt-2">
              <label class="me-2">Show:</label>
      <select v-model="pageSize" class="form-select form-select-sm d-inline-block w-auto">
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import exportService from '@/services/exportService'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['row-click', 'export', 'delete', 'edit'])

// Permission check functions - these can be overridden by parent component
function canDeleteItem(item) {
  // Check if parent component has provided a custom canDelete function
  if (typeof window.canDeleteOverride === 'function') {
    return window.canDeleteOverride(item)
  }
  // Default behavior - no delete permission
  return false
}

function canEditItem(item) {
  // Check if parent component has provided a custom canEdit function
  if (typeof window.canEditOverride === 'function') {
    return window.canEditOverride(item)
  }
  // Default behavior - no edit permission
  return false
}

// 响应式数据
const searchTerm = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const pageSize = ref(props.pageSize)

// 计算属性
const filteredData = computed(() => {
  if (!searchTerm.value) return props.data
  
  return props.data.filter(item => {
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })
})

const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value
  
  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredData.value.length))

const paginatedData = computed(() => {
  return sortedData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
function handleSearch() {
  currentPage.value = 1
}

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  // 处理 Firestore 时间戳
  if (dateString && typeof dateString === 'object' && dateString.seconds) {
    const date = new Date(dateString.seconds * 1000)
    return date.toLocaleDateString('en-US')
  }
  
  // 处理普通日期字符串
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US')
  } catch (error) {
    return 'N/A'
  }
}

function getStatusClass(status) {
  const statusClasses = {
    'active': 'badge bg-success',
    'inactive': 'badge bg-secondary',
    'pending': 'badge bg-warning',
    'blocked': 'badge bg-danger'
  }
  return statusClasses[status] || 'badge bg-secondary'
}

function handleRowClick(item) {
  emit('row-click', item)
}

function handleDelete(item) {
  emit('delete', item)
}

function handleEdit(item) {
  emit('edit', item)
}

function exportData(format) {
  const exportData = sortedData.value
  const filename = `data-export-${new Date().toISOString().split('T')[0]}`
  
  if (format === 'csv') {
    exportService.exportToCSV(exportData, `${filename}.csv`)
  } else if (format === 'pdf') {
    exportService.exportToPDF(exportData, `${filename}.pdf`, 'Data Export')
  }
  
  emit('export', { format, data: exportData })
}

// Watchers
watch(pageSize, () => {
  currentPage.value = 1
})

watch(() => props.data, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.table-controls {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
}

.table-row-clickable:hover {
  background-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-input {
  padding-left: 35px;
  border-radius: 25px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable-header:hover {
  background-color: rgba(102, 126, 234, 0.1);
}

.sortable-header.sorted {
  background-color: rgba(102, 126, 234, 0.2);
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: white;
}

.table td {
  vertical-align: middle;
}

.pagination-container {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.page-link {
  border: none;
  color: #667eea;
  padding: 0.5rem 0.75rem;
  margin: 0 2px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.page-link:hover {
  background-color: #667eea;
  color: white;
  transform: translateY(-1px);
}

.page-item.active .page-link {
  background-color: #667eea;
  border-color: #667eea;
}

.page-item.disabled .page-link {
  color: #6c757d;
  cursor: not-allowed;
}

.page-size-selector {
  font-size: 0.9rem;
  color: #6c757d;
}

.form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: border-color 0.3s ease;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .table-controls .row {
    flex-direction: column;
  }
  
  .col-md-6 {
    margin-bottom: 1rem;
  }
  
  .pagination-container .row {
    flex-direction: column;
    text-align: center;
  }
  
  .col-md-6:first-child {
    margin-bottom: 1rem;
  }
}
</style> 