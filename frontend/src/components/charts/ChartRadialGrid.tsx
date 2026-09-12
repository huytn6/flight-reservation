import React from "react"
import { TrendingUp } from "lucide-react"
import { PolarGrid, RadialBar, RadialBarChart } from "recharts"
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

export interface RadialGridDataItem {
  [key: string]: any
  name: string
  value: number
  fill?: string
}

export interface ChartRadialGridProps {
  title?: string
  description?: string
  data?: RadialGridDataItem[]
  config?: ChartConfig
  dataKey?: string
  nameKey?: string
  footerTrendText?: string
  footerSubText?: string
  className?: string
}

const defaultData: RadialGridDataItem[] = [
  { name: "chrome", value: 275, fill: "#0065eb" },
  { name: "safari", value: 200, fill: "#3b82f6" },
  { name: "firefox", value: 187, fill: "#60a5fa" },
  { name: "edge", value: 173, fill: "#93c5fd" },
  { name: "other", value: 90, fill: "#cbd5e1" },
]

const defaultConfig: ChartConfig = {
  value: {
    label: "Visitors",
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
    label: "Other",
    color: "#cbd5e1",
  },
}

export const ChartRadialGrid: React.FC<ChartRadialGridProps> = ({
  title = "Radial Chart - Grid",
  description = "January - June 2024",
  data = defaultData,
  config = defaultConfig,
  dataKey = "value",
  nameKey = "name",
  footerTrendText = "Trending up by 5.2% this month",
  footerSubText = "Showing total visitors for the last 6 months",
  className = "",
}) => {
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
          <RadialBarChart data={data} innerRadius={30} outerRadius={100}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey={nameKey} />}
            />
            <PolarGrid gridType="circle" stroke="#e2e8f0" />
            <RadialBar dataKey={dataKey} />
          </RadialBarChart>
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
