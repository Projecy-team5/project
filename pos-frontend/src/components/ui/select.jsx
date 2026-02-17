import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, onValueChange, value, ...props }, ref) => {
  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange(e.target.value)
    }
  }
  
  return (
    <select
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      value={value}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <Select ref={ref} className={cn(className)} {...props}>
    {children}
  </Select>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, ...props }) => {
  // This is handled by the parent Select
  return <span {...props}>{placeholder}</span>
}
SelectValue.displayName = "SelectValue"

const SelectContent = ({ children, className, ...props }) => (
  <div className={cn(className)} {...props}>
    {children}
  </div>
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ children, className, value, ...props }, ref) => (
  <option ref={ref} className={cn(className)} value={value} {...props}>
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
