<template>
  <el-container direction="vertical">
    <el-card>
        <h1>Basic</h1>
        <el-row>
            <el-col :span="8">
            Delegates count:
            <p>{{count}}</p>
            </el-col>
                        <el-col :span="8">
                Highest Vote Weight:
                
            </el-col>
            <el-col :span="8">
                Highest Productivity
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                test
            </el-col>
            <el-col :span="8">
                test
            </el-col>
            <el-col :span="8">
                Lowest Productivity:
            </el-col>
        </el-row>
       
    </el-card>
    <el-card>
      <el-table :data="allDelegates" stripe style="width: 100%">
          <el-table-column prop="rate" label="Rank" width="100"></el-table-column>
          <el-table-column
            prop="username"
            label="Username"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="producedBlocks"
            label="Produced Blocks"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="rewards"
            label="Rewards"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="productivity"
            label="Productivity"
          ></el-table-column>
          <el-table-column prop="approval" label="Approval"> </el-table-column>
        </el-table>
    </el-card>
  </el-container>
</template>

<script>
import * as gnyClient from '@gny/client';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
);

export default {
  data() {
    return {
      allDelegates: [],
      count: 101,
    }
  },
  async mounted() {
    try {
      const countWrapper = await connection.api.Delegate.count();
      if (countWrapper.success === true) {
        const count = countWrapper.count;
        const all = [];
        for (let offset = 0; offset < count; offset += 100) {
          const part = await connection.api.Delegate.getDelegates(offset, 100);
          if (part.success) {
            all.push(...part.delegates);
          }
        }
        this.allDelegates = all;
        this.count = all.length;
      } else {
        this.allDelegates = [];
      }
    } catch (err) {
      console.log(err.message);
    }
  }
}
</script>

<style>
.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}

.el-card {
  margin-top: 20px;
}

.el-col {
  font-weight: 500;
}

p {
  color: #acacac;
}

</style>
