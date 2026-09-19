import { useEffect, useState } from "react";
import "./CategoryChart.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { getCategoryData } from "../../services/categoryChartService";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#f59e0b",
  "#7c3aed",
  "#0891b2"
];

function CategoryChart() {

  const [data, setData] = useState([]);

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const chartData = await getCategoryData();

    setData(chartData);

  };

  return (

    <div className="category-chart">

      <h2>Category Analytics</h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label
          >

            {

              data.map((entry, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />

              ))

            }

          </Pie>

          <Tooltip/>

        </PieChart>

      </ResponsiveContainer>

    </div>

  );

}

export default CategoryChart;