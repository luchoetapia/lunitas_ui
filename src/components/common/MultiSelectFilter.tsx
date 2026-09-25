import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import ColorBar from './ColorBar'

interface MultiSelectFilterOption {
    value: string
    label: string
    // Accent color for this option's chip elsewhere in the UI (e.g. order status/channel).
    color?: string
}

interface MultiSelectFilterProps {
    label: string
    options: MultiSelectFilterOption[]
    selected: string[]
    onChange: (selected: string[]) => void
}

// "Todos" / "Ninguno" / one label / "N seleccionados" — shown in the closed select.
const getSummaryText = (selected: string[], options: MultiSelectFilterOption[]) => {
    if (selected.length === 0) return 'Ninguno'
    if (selected.length === options.length) return 'Todos'
    if (selected.length === 1) {
        return options.find((option) => option.value === selected[0])?.label ?? selected[0]
    }
    return `${selected.length} seleccionados`
}

// Generic dropdown with a checkbox per option, for any "filter by category" use case.
function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
    const labelId = `${label}-filter-label`

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const { value } = event.target
        onChange(typeof value === 'string' ? value.split(',') : value)
    }

    return (
        <FormControl size="small" sx={{ minWidth: '11rem' }}>
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
                labelId={labelId}
                multiple
                value={selected}
                onChange={handleChange}
                input={<OutlinedInput label={label} />}
                renderValue={() => getSummaryText(selected, options)}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={selected.includes(option.value)} size="small" />
                        {option.color && <ColorBar color={option.color} />}
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default MultiSelectFilter
