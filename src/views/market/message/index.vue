<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input v-model="listQuery.like_name" style="width: 200px;" class="filter-item" placeholder="名称" @keyup.enter.native="handleFilter"/>
      <el-button class="filter-item" type="primary" icon="search" @click="handleFilter">搜索</el-button>
      <el-button v-if="messageManager_btn_add" class="filter-item" style="margin-left: 10px;" type="primary" icon="edit" @click="handleCreate">添加</el-button>
    </div>
    <el-table v-loading.body="listLoading" :key="tableKey" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column v-if="show" align="center" label="pk_message_id">
        <template slot-scope="scope">
          <span>{{ scope.row.pkMessageId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="消息名称">
        <template slot-scope="scope">
          <span>{{ scope.row.messageName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="消息内容" width="400px">
        <template slot-scope="scope">
          <span>{{ scope.row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="消息类型" width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.type | messageTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="消息时间">
        <template slot-scope="scope">
          <span>{{ scope.row.messageTime }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作">
        <template slot-scope="scope">
          <el-button v-if="messageManager_btn_edit" size="small" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="messageManager_btn_del" size="small" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="消息名称" prop="messageName">
          <el-input v-model="form.messageName" placeholder="请输入消息名称"/>
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="form.type" filterable style="wdith:100%;">
            <el-option key="SW2701" label="系统广播" value="SW2701"/>
            <el-option key="SW2702" label="营销通知" value="SW2702"/>
            <el-option key="SW2703" label="每日报送" value="SW2703"/>
          </el-select>
        </el-form-item>
        <el-form-item label="消息时间" prop="messageTime">
          <el-date-picker
            v-model="form.messageTime"
            type="datetime"
            placeholder="请输入消息时间"
            default-time="12:00:00"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input v-model="form.content" type="textarea" placeholder="请输入消息内容"/>
        </el-form-item>
        <el-form-item label="消息摘要" prop="abstractMsg">
          <el-input v-model="form.abstractMsg" type="textarea" placeholder="请输入消息摘要"/>
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
import { page, addObj, getObj, delObj, putObj } from '@/api/market/message/index'
import { mapGetters } from 'vuex'
export default {
  name: 'Message',
  filters: {
    messageTypeFilter: function(val) {
      const map =  {
        'SW2701': '系统广播',
        'SW2702': '营销通知',
        'SW2703': '每日报送'
      }
      return map[val]
    }
  },
  data() {
    return {
      form: {
        messageName: undefined,
        content: undefined,
        type: undefined,
        abstractMsg: undefined,
        messageTime: undefined,
        messageSender: undefined
      },
      rules: {
        messageName: [
          {
            required: true,
            message: '请输入消息名称',
            trigger: 'blur'
          }
        ], content: [
          {
            required: true,
            message: '请输入消息内容',
            trigger: 'blur'
          }
        ], type: [
          {
            required: true,
            message: '请输入消息类型',
            trigger: 'blur'
          }
        ], messageTime: [
          {
            required: true,
            message: '请输入消息时间',
            trigger: 'blur'
          }
        ]},
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
      messageManager_btn_edit: false,
      messageManager_btn_del: false,
      messageManager_btn_add: false,
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
    this.messageManager_btn_edit = this.elements['market:message:edit']
    this.messageManager_btn_del = this.elements['market:message:delete']
    this.messageManager_btn_add = this.elements['market:message:add']
  },
  methods: {
    getList() {
      this.listLoading = true
      page(this.listQuery).then(response => {
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
      getObj(row.pkMessageId).then(response => {
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
      }).then(() => {
        delObj(row.pkMessageId)
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
    create(formName) {
      const set = this.$refs
      set[formName].validate(valid => {
        if (valid) {
          addObj(this.form).then(() => {
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
          this.form.password = undefined
          putObj(this.form.pkMessageId, this.form).then(() => {
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
    resetTemp() {
      this.form = {
        messageName: undefined,
        content: undefined,
        type: undefined,
        abstractMsg: undefined,
        messageTime: undefined,
        messageSender: undefined
      }
    }
  }
}
</script>
<style>
  .el-select{
    width: 100%;
  }

  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
  }
</style>
