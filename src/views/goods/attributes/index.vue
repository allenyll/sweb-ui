<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input v-model="listQuery.like_attr_name" style="width: 200px;" class="filter-item" placeholder="名称" @keyup.enter.native="handleFilter"/>
      <el-button class="filter-item" type="primary" icon="search" @click="handleFilter">搜索</el-button>
      <el-button v-if="attributesManager_btn_add" class="filter-item" style="margin-left: 10px;" type="primary" icon="edit" @click="handleCreate">添加</el-button>
    </div>
    <el-table v-loading.body="listLoading" :key="tableKey" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column v-if="show" align="center" label="pk_attribute_id">
        <template slot-scope="scope">
          <span>{{ scope.row.pkAttributeId }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="分类">
            <template slot-scope="scope">
              <span>{{categoryNameMap[scope.row.fkCategoryId]}}</span>
            </template>
          </el-table-column> -->
      <el-table-column align="center" label="属性名称">
        <template slot-scope="scope">
          <span>{{ scope.row.attrName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="属性类型">
        <template slot-scope="scope">
          <span>{{ attrTypeNameMap[scope.row.attType] }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="属性值">
        <template slot-scope="scope">
          <span>{{ scope.row.attrVal }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否有效">
        <template slot-scope="scope">
          <span>{{ scope.row.status | isOrNoFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="center" label="操作" width="150px">
        <template slot-scope="scope">
          <el-button v-if="attributesManager_btn_edit" size="small" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="attributesManager_btn_del" size="small" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="closeDialog()">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="属性名称" prop="attrName">
          <el-input v-model="form.attrName" placeholder="请输入属性名称"/>
        </el-form-item>
        <el-form-item label="属性值" prop="attrVal">
          <el-input v-model="form.attrVal" placeholder="请输入属性值"/>
        </el-form-item>
        <el-form-item label="所属分类" prop="fkCategoryId">
          <TreeSelect v-model="form.fkCategoryId" :multiple="true" :options="categoryTree" placeholder="请选择分类"/>
        </el-form-item>
        <el-form-item label="属性类型" prop="attType">
          <el-select v-model="form.attType" filterable placeholder="请选择" style="wdith:236px;">
            <el-option
              v-for="item in attrTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="attrSeq">
          <el-input v-model="form.attrSeq" placeholder="请输入排序"/>
        </el-form-item>
        <el-form-item label="是否显示" prop="isShow">
          <el-radio v-model="form.isShow" label="SW1001">是</el-radio>
          <el-radio v-model="form.isShow" label="SW1002">否</el-radio>
        </el-form-item>
        <el-form-item label="是否有效" prop="status">
          <el-radio v-model="form.status" label="SW1001">是</el-radio>
          <el-radio v-model="form.status" label="SW1002">否</el-radio>
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
import { page, addObj, getObj, delObj, putObj } from '@/api/goods/attributes/index'
import { getList } from '@/api/admin/dict/index'
import { getCategoryList, categoryTree } from '@/api/goods/category/index'
// import the component
import TreeSelect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { mapGetters } from 'vuex'
export default {
  name: 'Attributes',
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
        fkCategoryId: null,
        attrName: undefined,
        attType: undefined,
        attrVal: undefined,
        attrSeq: undefined,
        isShow: undefined,
        status: undefined
      },
      rules: {
        attrName: [
          {
            required: true,
            message: '请输入属性名称',
            trigger: 'blur'
          }
        ],
        attType: [
          {
            required: true,
            message: '请输入属性类型',
            trigger: 'blur'
          }
        ],
        attrVal: [
          {
            required: true,
            message: '请输入属性值',
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
            message: '请选择是否有效',
            trigger: 'blur'
          }
        ],
        fkCategoryId: [
          {
            required: true,
            message: '请选择分类',
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
        eq_attr_name: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      attributesManager_btn_edit: false,
      attributesManager_btn_del: false,
      attributesManager_btn_add: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0,
      show: false,
      categoryMap: [],
      categoryOptions: [],
      attrTypeDictMap: [],
      attrTypeOptions: [],
      categoryTree: []
    }
  },
  computed: {
    ...mapGetters([
      'elements'
    ]),
    categoryNameMap: function() {
      return this.categoryMap
    },
    attrTypeNameMap: function() {
      return this.attrTypeDictMap
    }
  },
  created() {
    this.getList()
    this.getCategoryList()
    this.getDict()
    this.categoryTreeList()
    this.attributesManager_btn_edit = this.elements['goods:attributes:edit']
    this.attributesManager_btn_del = this.elements['goods:attributes:delete']
    this.attributesManager_btn_add = this.elements['goods:attributes:add']
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
      getObj(row.pkAttributeId).then(response => {
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
        delObj(row.pkAttributeId)
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
          putObj(this.form.pkAttributeId, this.form).then(() => {
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
        fkCategoryId: null,
        attrName: undefined,
        attType: undefined,
        attrVal: undefined,
        attrSeq: undefined,
        isShow: 'SW1001',
        status: 'SW1001'
      }
    },
    closeDialog() {
      this.form.fkCategoryId = null
    },
    getCategoryList() {
      getCategoryList().then(response => {
        this.categoryMap = response.data.map
        this.categoryOptions = response.data.list
      })
    },
    getDict() {
      getList('SW19').then(res => {
        this.attrTypeOptions = res.data.list
        this.attrTypeDictMap = res.data.map
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
