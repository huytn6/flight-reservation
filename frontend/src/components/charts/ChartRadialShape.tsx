import React from "react"
import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
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
  type ChartConfig,
} from "@/components/ui/chart"

export interface ChartRadialShapeProps {
  title?: string
  description?: string
  value?: number
  label?: string
  color?: string
  endAngle?: number
  footerTrendText?: string
  footerSubText?: string
  className?: string
}

const defaultConfig: ChartConfig = {
  value: {
    label: "Target Progress",
    color: "#0065eb",
  },
}

export const ChartRadialShape: React.FC<ChartRadialShapeProps> = ({
  title = "Radial Chart - Shape",
  description = "January - June 2024",
  value = 1260,
  label = "Target",
  color = "#0065eb",
  endAngle = 100,
  footerTrendText = "Trending up by 5.2% this month",
  footerSubText = "Showing total operational capacity achieved",
  className = "",
}) => {
  const chartData = [{ name: label.toLowerCase(), value, fill: color }]
  const chartConfig: ChartConfig = {
    value: { label, color },
  }

  return (
    <Card className={`flex flex-col bg-white border-0 shadow-none ${className}`}>
      <CardHeader className="items-center pb-0 pt-4">
        <CardTitle className="text-xs font-semibold text-slate-900">{title}</CardTitle>
        <CardDescription className="text-[11px] text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-2">
        <ChartContainer
          config={chartConfig || defaultConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={endAngle}
            innerRadius={65}
            outerRadius={95}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-slate-100 last:fill-white"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background={{ fill: '#f1f5f9' }} fill={color} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                          className="fill-slate-900 text-3xl font-bold"
                        >
                          {value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-slate-500 text-xs font-medium"
                        >
                          {label}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-xs pt-2 pb-4 text-center">
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
