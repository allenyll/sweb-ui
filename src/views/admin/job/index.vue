<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input v-model="listQuery.like_job_name" style="width: 200px;" class="filter-item" placeholder="任务名称" @keyup.enter.native="handleFilter"/>
      <el-input v-model="listQuery.like_class_name" style="width: 200px;" class="filter-item" placeholder="调用类名" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.eq_status" style="width: 200px;" class="filter-item" placeholder="请选择状态" @keyup.enter.native="handleFilter">
        <el-option key="" label="全部" value=""/>
        <el-option key="SW1302" label="启用" value="SW1302"/>
        <el-option key="SW1301" label="停用" value="SW1301"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="search" @click="handleFilter">搜索</el-button>
      <el-button v-if="jobManager_btn_add" class="filter-item" style="margin-left: 10px;" type="primary" icon="edit" @click="handleCreate">添加</el-button>
    </div>
    <el-table v-loading.body="listLoading" :key="tableKey" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column v-if="show" align="center" label="pk_job_id">
        <template slot-scope="scope">
          <span>{{ scope.row.pkJobId }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.jobName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="调用方法名">
        <template slot-scope="scope">
          <span>{{ scope.row.methodName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="表达式">
        <template slot-scope="scope">
          <span>{{ scope.row.corn }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80px" align="center" label="任务状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilters }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="调用类名">
        <template slot-scope="scope">
          <span>{{ scope.row.className }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="任务分组">
        <template slot-scope="scope">
          <span>{{ scope.row.jobGroup }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="描述">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="springBean">
        <template slot-scope="scope">
          <span>{{ scope.row.springBean }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作" width="300px">
        <template slot-scope="scope">
          <el-button v-if="jobManager_btn_edit" size="small" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="jobManager_btn_del" size="small" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
          <el-button v-show="jobManager_btn_status" size="small" type="info" @click="handleStatus(scope.row, 'start')">启用
          </el-button>
          <el-button v-show="jobManager_btn_status" size="small" type="warning" @click="handleStatus(scope.row, 'stop')">停用
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="jobName">
          <el-input v-model="form.jobName" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="调用方法名" prop="methodName">
          <el-input v-model="form.methodName" placeholder="请输入调用方法名"/>
        </el-form-item>
        <el-form-item label="表达式" prop="corn">
          <el-input v-model="form.corn" placeholder="请输入表达式"/>
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-radio v-model="form.status" label="SW1301">停用</el-radio>
          <el-radio v-model="form.status" label="SW1302">启用</el-radio>
        </el-form-item>
        <el-form-item label="调用类名" prop="className">
          <el-input v-model="form.className" placeholder="请输入调用类名"/>
        </el-form-item>
        <el-form-item label="任务分组" prop="jobGroup">
          <el-input v-model="form.jobGroup" placeholder="请输入任务分组"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述"/>
        </el-form-item>
        <el-form-item label="springBean" prop="springBean">
          <el-input v-model="form.springBean" placeholder="请输入springBean"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('form')">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
        <el-button v-else type="primary" @click="update('form')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, addObj, getObj, delObj, putObj, updateStatus } from '@/api/admin/job/index'
import { mapGetters } from 'vuex'
export default {
  name: 'Job',
  filters: {
    statusFilters: function(val) {
      const map = {
        'SW1301': '停用',
        'SW1302': '启用'
      }
      return map[val]
    },
    statusTypeFilter(status) {
      const statusMap = {
        'SW1302': 'success',
        'SW1301': 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      form: {
        jobName: undefined,
        methodName: undefined,
        corn: undefined,
        status: undefined,
        className: undefined,
        jobGroup: undefined,
        description: undefined,
        springBean: undefined
      },
      rules: {
        jobName: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ],
        methodName: [
          {
            required: true,
            message: '请输入调用方法名',
            trigger: 'blur'
          }
        ],
        corn: [
          {
            required: true,
            message: '请输入表达式',
            trigger: 'blur'
          }
        ],
        status: [
          {
            required: true,
            message: '请输入任务状态',
            trigger: 'blur'
          }
        ],
        className: [
          {
            required: true,
            message: '请输入调用类名',
            trigger: 'blur'
          }
        ]
      },
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      jobManager_btn_edit: false,
      jobManager_btn_del: false,
      jobManager_btn_add: false,
      jobManager_btn_status: false,
      status: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0,
      show: false
    }
  },
  computed: {
    ...mapGetters([
      'elements'
    ])
  },
  created() {
    this.getList()
    this.jobManager_btn_edit = this.elements['sys:job:edit']
    this.jobManager_btn_del = this.elements['sys:job:delete']
    this.jobManager_btn_add = this.elements['sys:job:add']
    this.jobManager_btn_status = this.elements['sys:job:status']
  },
  methods: {
    getList() {
      this.listLoading = true
      page(this.listQuery)
        .then(response => {
          this.list = response.data.list
          this.total = response.data.total
          this.listLoading = false
        })
    },
    handleFilter() {
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      getObj(row.pkJobId)
        .then(response => {
          this.form = response.data.obj
          this.dialogFormVisible = true
          this.dialogStatus = 'update'
        })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          delObj(row.pkJobId)
            .then(() => {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
              const index = this.list.indexOf(row)
              this.list.splice(index, 1)
            })
        })
    },
    handleStatus(row, flag) {
      var msg = ''
      var sMsg = ''
      if (flag === 'start') {
        msg = '确定启用该任务？'
        sMsg = '启用成功'
        if (row.status === 'SW1302') {
          this.$notify({
            title: '提示',
            message: '该任务已启用',
            type: 'info',
            duration: 2000
          })
          return
        }
      } else if (flag === 'stop') {
        msg = '确定停用该任务？'
        sMsg = '停用成功'
        if (row.status === 'SW1301') {
          this.$notify({
            title: '提示',
            message: '该任务已停用',
            type: 'info',
            duration: 2000
          })
          return
        }
      }
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateStatus(row.pkJobId, flag)
          .then(() => {
            this.getList()
            this.$notify({
              title: '成功',
              message: sMsg,
              type: 'success',
              duration: 2000
            })
          })
      })
    },
    create(formName) {
      const set = this.$refs
      set[formName].validate(valid => {
        if (valid) {
          addObj(this.form)
            .then(() => {
              this.dialogFormVisible = false
              this.getList()
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
        } else {
          return false
        }
      })
    },
    cancel(formName) {
      this.dialogFormVisible = false
      const set = this.$refs
      set[formName].resetFields()
    },
    update(formName) {
      const set = this.$refs
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false
          putObj(this.form.pkJobId, this.form).then(() => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        } else {
          return false
        }
      })
    },
    resetTemp() {
      this.form = {
        jobName: undefined,
        methodName: undefined,
        corn: undefined,
        status: 'SW1302',
        className: undefined,
        jobGroup: undefined,
        description: undefined,
        springBean: undefined
      }
    }
  }
}
</script>
