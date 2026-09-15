import React, { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface PieDonutTextDataItem {
  [key: string]: any
  name: string
  value: number
  fill?: string
}

export interface ChartPieDonutTextProps {
  title?: string
  description?: string
  data?: PieDonutTextDataItem[]
  config?: ChartConfig
  dataKey?: string
  nameKey?: string
  centerLabel?: string
  footerTrendText?: string
  footerSubText?: string
  className?: string
}

const defaultData: PieDonutTextDataItem[] = [
  { name: "chrome", value: 275, fill: "#0065eb" },
  { name: "safari", value: 200, fill: "#3b82f6" },
  { name: "firefox", value: 287, fill: "#60a5fa" },
  { name: "edge", value: 173, fill: "#93c5fd" },
  { name: "other", value: 190, fill: "#cbd5e1" },
]

const defaultConfig: ChartConfig = {
  value: {
    label: "Tổng Chỉ Số",
  },
  chrome: {
    label: "Chrome",
    color: "#0065eb",
  },
  safari: {
    label: "Safari",
    color: "#3b82f6",
  },
  firefox: {
    label: "Firefox",
    color: "#60a5fa",
  },
  edge: {
    label: "Edge",
    color: "#93c5fd",
  },
  other: {
    label: "Khác",
    color: "#cbd5e1",
  },
}

export const ChartPieDonutText: React.FC<ChartPieDonutTextProps> = ({
  title = "Biểu Đồ Tròn - Donut Có Chữ",
  description = "Tháng 1 - Tháng 6 năm 2024",
  data = defaultData,
  config = defaultConfig,
  dataKey = "value",
  nameKey = "name",
  centerLabel = "Số lượt truy cập",
  footerTrendText = "Tăng 5.2% trong tháng này",
  footerSubText = "Hiển thị phân bố tổng chỉ số",
  className = "",
}) => {
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr[dataKey] || 0), 0)
  }, [data, dataKey])

  return (
    <Card className={`flex flex-col bg-white border-0 shadow-none ring-0 ${className}`}>
      <CardHeader className="items-center pb-0 pt-4">
        <CardTitle className="text-xs font-semibold text-slate-900">{title}</CardTitle>
        <CardDescription className="text-[11px] text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-2">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={4}
              stroke="#ffffff"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-slate-900 text-2xl font-bold"
                        >
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-slate-500 text-xs font-medium"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-xs pt-2 pb-4 text-center border-t-0 bg-transparent">
        {footerTrendText && (
          <div className="flex items-center justify-center gap-1.5 font-medium text-[#0065eb]">
            {footerTrendText} <TrendingUp className="h-3.5 w-3.5" />
          </div>
        )}
        {footerSubText && (
          <div className="text-[11px] text-slate-500 font-normal">
            {footerSubText}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
