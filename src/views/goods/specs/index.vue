<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input v-model="listQuery.like_name" style="width: 200px;" class="filter-item" placeholder="名称" @keyup.enter.native="handleFilter"/>
      <el-button class="filter-item" type="primary" icon="search" @click="handleFilter">搜索</el-button>
      <el-button v-if="specsManager_btn_add" class="filter-item" style="margin-left: 10px;" type="primary" icon="edit" @click="handleCreate">添加</el-button>
    </div>
    <el-table v-loading.body="listLoading" :key="tableKey" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column v-if="show" align="center" label="pk_specs_id">
        <template slot-scope="scope">
          <span>{{ scope.row.pkSpecsId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="规格组">
        <template slot-scope="scope">
          <span>{{ specsGroupNameMap[scope.row.fkSpecsGroupId] }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="分类">
            <template slot-scope="scope">
              <span>{{categoryNameMap[scope.row.fkCategoryId]}}</span>
            </template>
          </el-table-column> -->
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.specsName }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="类型">
            <template slot-scope="scope">
              <span>{{scope.row.specsType}}</span>
            </template>
          </el-table-column> -->
      <el-table-column align="center" label="值">
        <template slot-scope="scope">
          <span>{{ scope.row.specsVal }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否有效">
        <template slot-scope="scope">
          <span>{{ scope.row.status | isOrNoFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="设置" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="getSpecsOptions(scope.row)">规格选项
          </el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作" width="150px">
        <template slot-scope="scope">
          <el-button v-if="specsManager_btn_edit" size="small" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="specsManager_btn_del" size="small" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="closeDialog()">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="specsName">
          <el-input v-model="form.specsName" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="规格值" prop="specsVal">
          <el-input v-model="form.specsVal" placeholder="请输入规格值"/>
        </el-form-item>
        <el-form-item label="所属分类" prop="fkCategoryId">
          <TreeSelect v-model="form.fkCategoryId" :flat="true" :default-expand-level="1" :multiple="true" :options="categoryTree" placeholder="请选择分类"/>
        </el-form-item>
        <el-form-item label="规格组" prop="fkSpecsGroupId">
          <el-select v-model="form.fkSpecsGroupId" filterable placeholder="请选择规格组">
            <el-option
              v-for="item in specsGroupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="specsSeq">
          <el-input v-model="form.specsSeq" placeholder="请输入排序"/>
        </el-form-item>
        <el-form-item label="是否有效" prop="status">
          <el-radio v-model="form.status" label="SW1001">是</el-radio>
          <el-radio v-model="form.status" label="SW1002">否</el-radio>
        </el-form-item>
        <el-form-item label="是否显示" prop="isShow">
          <el-radio v-model="form.isShow" label="SW1001">是</el-radio>
          <el-radio v-model="form.isShow" label="SW1002">否</el-radio>
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
import { page, addObj, getObj, delObj, putObj } from '@/api/goods/specs/index'
import { getSpecsGroupList } from '@/api/goods/specsGroup/index'
import { getCategoryList, categoryTree } from '@/api/goods/category/index'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { mapGetters } from 'vuex'
export default {
  name: 'Specs',
  components: {
    TreeSelect
  },
  filters: {
    isOrNoFilter: function(val) {
      const map = {
        'SW1001': '是',
        'SW1002': '否'
      }
      return map[val]
    }
  },
  data() {
    return {
      form: {
        fkSpecsGroupId: undefined,
        fkCategoryId: null,
        specsName: undefined,
        specsType: undefined,
        specsVal: undefined,
        specsSeq: undefined,
        isShow: undefined,
        status: undefined
      },
      rules: {
        fkSpecsGroupId: [
          {
            required: true,
            message: '请输入规格主键',
            trigger: 'blur'
          }
        ],
        fkCategoryId: [
          {
            required: true,
            message: '请输入分类主键',
            trigger: 'blur'
          }
        ],
        specsName: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ],
        specsVal: [
          {
            required: true,
            message: '请输入值',
            trigger: 'blur'
          }
        ],
        isShow: [
          {
            required: true,
            message: '请输入是否显示',
            trigger: 'blur'
          }
        ],
        status: [
          {
            required: true,
            message: '请输入',
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
      dialogFormVisible: false,
      dialogStatus: '',
      specsManager_btn_edit: false,
      specsManager_btn_del: false,
      specsManager_btn_add: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0,
      show: false,
      categoryMap: [],
      categoryOptions: [],
      specsGroupOptions: [],
      specsGroupNameMap: [],
      categoryTree: []
    }
  },
  computed: {
    ...mapGetters([
      'elements'
    ]),
    categoryNameMap: function() {
      return this.categoryMap
    }
  },
  created() {
    this.getList(data => {
      if (!data) {
        return
      }
      this.getCategoryList()
      this.getSpecsGroupList()
      this.categoryTreeList()
    })
    this.specsManager_btn_edit = this.elements['goods:specs:edit']
    this.specsManager_btn_del = this.elements['goods:specs:delete']
    this.specsManager_btn_add = this.elements['goods:specs:add']
  },
  methods: {
    getList(callback) {
      this.listLoading = true
      page(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
        callback(true)
      }).catch((reject) => {
        callback(false)
      })
    },
    handleFilter() {
      this.getList(data => {})
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList(data => {})
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList(data => {})
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      getObj(row.pkSpecsId).then(response => {
        this.form = response.data.obj
        this.form.fkCategoryId = response.data.obj.categoryIds
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
        delObj(row.pkSpecsId)
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
            this.getList(data => {})
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
      this.form.fkCategoryId = null
      const set = this.$refs
      set[formName].resetFields()
    },
    update(formName) {
      const set = this.$refs
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false
          this.form.password = undefined
          putObj(this.form.pkSpecsId, this.form).then(() => {
            this.dialogFormVisible = false
            this.getList(data => {})
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
        fkSpecsGroupId: undefined,
        fkCategoryId: null,
        specsName: undefined,
        specsType: undefined,
        specsVal: undefined,
        specsSeq: undefined,
        isShow: 'SW1001',
        status: 'SW1001'
      }
    },
    closeDialog() {
      this.form.fkCategoryId = null
    },
    getSpecsOptions(row) {
      this.$router.push({ path: '/goods/specOption', query: { id: row.pkSpecsId }})
    },
    getCategoryList() {
      getCategoryList().then(response => {
        this.categoryMap = response.data.map
        this.categoryOptions = response.data.list
      })
    },
    getSpecsGroupList() {
      getSpecsGroupList().then(res => {
        this.specsGroupNameMap = res.data.map
        this.specsGroupOptions = res.data.list
      })
    },
    categoryTreeList() {
      categoryTree().then(res => {
        this.categoryTree = res.data.categoryTree
      })
    }
  }
}
</script>
<style>
  .el-select{
    width:100%;
  }
</style>
