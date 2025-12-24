<template>
  <div class="dashboard-container">
    <!-- 数据概览卡片 -->
    <a-row :gutter="24" class="dashboard-stats">
      <a-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-title">{{ item.title }}</div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-desc">{{ item.desc }}</div>
          <div class="stat-chart">
            <v-chart :option="item.chartOption" :style="{ height: '60px' }" autoresize/>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要数据展示区域 -->
    <a-row :gutter="24" class="main-content">
      <!-- 左侧图表 -->
      <a-col :xs="24" :lg="16">
        <a-card :bordered="false" class="chart-card">
          <template #title>销售趋势</template>
          <div class="chart-container">
            <v-chart :option="salesTrendOptions" :style="{ height: '350px' }" autoresize/>
          </div>
        </a-card>

        <a-card :bordered="false" class="chart-card" style="margin-top: 24px;">
          <template #title>用户地域分布</template>
          <div class="chart-container">
            <v-chart :option="regionDistributionOptions" :style="{ height: '300px' }" autoresize/>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧数据表格 -->
      <a-col :xs="24" :lg="8" style="margin-top: 24px;">
        <a-card :bordered="false" class="table-card">
          <template #title>最新订单</template>
          <a-table
              :columns="orderColumns"
              :data-source="latestOrders"
              :pagination="{ pageSize: 5, hideOnSinglePage: true }"
              size="small"
              :scroll="{ x: 600, y: 250 }"
              :bordered="true"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag :color="statusColor(record.status)">
                  {{ statusText(record.status) }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card :bordered="false" class="table-card" style="margin-top: 24px;">
          <template #title>热门商品</template>
          <a-table
              :columns="productColumns"
              :data-source="popularProducts"
              :pagination="{ pageSize: 5, hideOnSinglePage: true }"
              size="small"
              :scroll="{ x: 500, y: 250 }"
              :bordered="true"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'sales'">
                <a-progress
                    :percent="record.sales"
                    :show-info="false"
                    :stroke-color="progressColor(record.sales)"
                    size="small"
                />
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import VChart from 'vue-echarts';

export default {
  name: 'HomePage',
  components: {VChart},
  data() {
    return {
      statCards: [
        {
          title: '今日访问量',
          value: '2,456',
          desc: '较昨日 +12.5%',
          chartOption: this.createMiniChart([300, 350, 300, 350, 300, 350, 300], '#1890ff')
        },
        {
          title: '订单总数',
          value: '1,892',
          desc: '较昨日 +8.2%',
          chartOption: this.createMiniChart([250, 200, 300, 350, 300, 250, 200], '#52c41a')
        },
        {
          title: '销售额',
          value: '¥ 89,450',
          desc: '较昨日 +15.7%',
          chartOption: this.createMiniChart([150, 250, 200, 350, 300, 250, 400], '#faad14')
        },
        {
          title: '用户增长',
          value: '+1,245',
          desc: '较昨日 +22.3%',
          chartOption: this.createMiniChart([120, 150, 180, 200, 220, 250, 280], '#ff4d4f')
        }
      ],

      latestOrders: [
        {id: '20231001001', customer: '张三', amount: '¥289.00', status: 'paid', date: '2023-10-01'},
        {id: '20231001002', customer: '李四', amount: '¥456.50', status: 'processing', date: '2023-10-01'},
        {id: '20231001003', customer: '王五', amount: '¥128.90', status: 'paid', date: '2023-10-01'},
        {id: '20231001004', customer: '赵六', amount: '¥789.00', status: 'shipped', date: '2023-10-01'},
        {id: '20231001005', customer: '钱七', amount: '¥345.20', status: 'paid', date: '2023-10-01'}
      ],
      popularProducts: [
        {name: '智能手表', sales: 85, category: '电子产品'},
        {name: '无线耳机', sales: 92, category: '电子产品'},
        {name: '运动T恤', sales: 78, category: '服装'},
        {name: '蓝牙音箱', sales: 88, category: '电子产品'},
        {name: '保温杯', sales: 65, category: '家居'}
      ],

      orderColumns: [
        {title: '订单ID', dataIndex: 'id', width: 120, ellipsis: true},
        {title: '客户', dataIndex: 'customer', width: 80},
        {title: '金额', dataIndex: 'amount', width: 90},
        {title: '状态', dataIndex: 'status', width: 80},
        {title: '日期', dataIndex: 'date', width: 100}
      ],
      productColumns: [
        {title: '商品', dataIndex: 'name', width: 100, ellipsis: true},
        {title: '销量', dataIndex: 'sales', width: 80, slots: {customRender: 'sales'}},
        {title: '类别', dataIndex: 'category', width: 80}
      ]
    };
  },

  computed: {
    salesTrendOptions() {
      const data = [
        {date: '10/01', sales: 1200, orders: 45},
        {date: '10/02', sales: 1500, orders: 52},
        {date: '10/03', sales: 1300, orders: 48},
        {date: '10/04', sales: 1800, orders: 65},
        {date: '10/05', sales: 1600, orders: 58},
        {date: '10/06', sales: 2000, orders: 72},
        {date: '10/07', sales: 1900, orders: 68}
      ];
      return {
        tooltip: {trigger: 'axis', formatter: '{b0}<br/>{a0}: {c0}元<br/>{a1}: {c1}单'},
        legend: {data: ['销售额', '订单量'], right: 10, top: 10},
        grid: {left: '3%', right: '4%', bottom: '3%', containLabel: true},
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.map(item => item.date),
          axisLine: {lineStyle: {color: '#e8e8e8'}}
        },
        yAxis: {
          type: 'value',
          axisLine: {lineStyle: {color: '#e8e8e8'}},
          splitLine: {lineStyle: {type: 'dashed', color: '#e8e8e8'}}
        },
        series: [
          {
            name: '销售额',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {color: '#1890ff'},
            lineStyle: {width: 2},
            data: data.map(item => item.sales)
          },
          {
            name: '订单量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {color: '#52c41a'},
            lineStyle: {width: 2},
            data: data.map(item => item.orders)
          }
        ]
      };
    },

    regionDistributionOptions() {
      return {
        tooltip: {trigger: 'item', formatter: '{b}: {c} ({d}%)'},
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['华东', '华南', '华北', '华中', '西南', '西北', '东北'],
          formatter(name) {
            return name.length > 4 ? `${name.substring(0, 2)}...` : name;
          }
        },
        series: [{
          name: '用户分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {show: false},
          emphasis: {label: {show: true, fontSize: '14', fontWeight: 'bold'}},
          labelLine: {show: true},
          data: [
            {value: 335, name: '华东'},
            {value: 310, name: '华南'},
            {value: 274, name: '华北'},
            {value: 235, name: '华中'},
            {value: 400, name: '西南'},
            {value: 250, name: '西北'},
            {value: 200, name: '东北'}
          ]
        }]
      };
    }
  },

  methods: {
    createMiniChart(data, color) {
      return {
        grid: {top: 0, right: 0, bottom: 0, left: 0},
        xAxis: {show: false},
        yAxis: {show: false},
        series: [{
          type: 'line',
          data,
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {offset: 0, color: color + '30'},
                {offset: 1, color: color + '00'}
              ]
            }
          },
          itemStyle: {color},
          lineStyle: {width: 1.5}
        }]
      };
    },

    statusColor(status) {
      return {
        paid: '#52c41a',
        processing: '#faad14',
        shipped: '#1890ff',
        cancelled: '#ff4d4f'
      }[status] || '#1890ff';
    },

    statusText(status) {
      return {
        paid: '已支付',
        processing: '处理中',
        shipped: '已发货',
        cancelled: '已取消'
      }[status] || '未知';
    },

    progressColor(sales) {
      if (sales > 85) return '#52c41a';
      if (sales > 70) return '#faad14';
      return '#ff4d4f';
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-stats {
  margin-bottom: 24px;
}

.stat-card {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px !important;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
}

.stat-title {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin: 4px 0;
}

.stat-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.stat-chart {
  flex: 1;
  min-height: 60px;
}

.chart-card,
.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
}

.chart-container {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 表格样式优化 */
:deep(.ant-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f5f5f5;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9f9f9 !important;
}
</style>