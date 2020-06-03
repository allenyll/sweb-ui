<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input v-model="listQuery.like_brand_name" style="width: 200px;" class="filter-item" placeholder="名称" @keyup.enter.native="handleFilter"/>
      <el-button class="filter-item" type="primary" icon="search" @click="handleFilter">搜索</el-button>
      <el-button v-if="brandManager_btn_add" class="filter-item" style="margin-left: 10px;" type="primary" icon="edit" @click="handleCreate">添加</el-button>
    </div>
    <el-table v-loading.body="listLoading" :key="tableKey" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column v-if="show" align="center" label="pk_brand_id">
        <template slot-scope="scope">
          <span>{{ scope.row.pkBrandId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="品牌名称">
        <template slot-scope="scope">
          <span>{{ scope.row.brandName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="品牌编码">
        <template slot-scope="scope">
          <span>{{ scope.row.brandNo }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="品牌类型">
        <template slot-scope="scope">
          <span>{{ scope.row.brandType | brandFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作" width="150px">
        <template slot-scope="scope">
          <el-button v-if="brandManager_btn_edit" size="small" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="brandManager_btn_del" size="small" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="form.brandName" placeholder="请输入"/>
        </el-form-item>
        <el-form-item label="品牌编码" prop="brandNo">
          <el-input v-model="form.brandNo" placeholder="请输入品牌编码"/>
        </el-form-item>
        <el-form-item label="品牌类型">
          <el-select v-model="form.brandType" class="filter-item" placeholder="请选择">
            <el-option v-for="item in brandOptions" :key="item.value" :label="item.name" :value="item.value"/>
          </el-select>
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
import { page, addObj, getObj, delObj, putObj } from '@/api/goods/brand/index'
import { mapGetters } from 'vuex'
export default {
  name: 'Brand',
  filters: {
    brandFilter: function(val) {
      const map = {
        'SW1501': '商品',
        'SW1502': '店铺'
      }
      return map[val]
    }
  },
  data() {
    return {
      form: {
        brandName: undefined,
        brandNo: undefined,
        brandType: undefined
      },
      rules: {
        brandName: [
          {
            required: true,
            message: '请输入',
            trigger: 'blur'
          }
        ],
        brandNo: [
          {
            required: true,
            message: '请输入品牌编码',
            trigger: 'blur'
          }
        ],
        brandType: [
          {
            required: true,
            message: '请输入品牌类型',
            trigger: 'blur'
          }
        ] },
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined
      },
      brandOptions: [
        {
          'name': '商品',
          'value': 'SW1501'
        },
        {
          'name': '店铺',
          'value': 'SW1502'
        }
      ],
      dialogFormVisible: false,
      dialogStatus: '',
      brandManager_btn_edit: false,
      brandManager_btn_del: false,
      brandManager_btn_add: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0,
      show: false
    }
  },
  created() {
    this.getList()
    this.brandManager_btn_edit = this.elements['goods:brand:edit']
    this.brandManager_btn_del = this.elements['goods:brand:delete']
    this.brandManager_btn_add = this.elements['goods:brand:add']
  },
  computed: {
    ...mapGetters([
      'elements'
    ])
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
      getObj(row.pkBrandId)
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
          delObj(row.pkBrandId)
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
          this.form.password = undefined
          putObj(this.form.pkBrandId, this.form).then(() => {
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
        brandName: undefined,
        brandNo: undefined,
        brandType: undefined
      }
    }
  }
}
</script>
