# Jay's Engineering Lab — Engineering Standards

Date: 2026-09-18

## Purpose

Jay's Engineering Lab is an engineering record system, not only a web application.

These standards protect the quality of the engineering information stored inside it. They apply to circuit calculations, measurements, component records, project notes, tests, and software features.

## 1. Evidence levels

Every important engineering result should be distinguishable by evidence source:

| Evidence | Meaning |
|---|---|
| Theoretical | Calculated from a known equation/model |
| Simulated | Produced by software or a circuit simulation |
| Measured | Obtained from physical hardware or an instrument |
| Observed | Directly noticed during a physical/software test |
| Derived | Calculated from recorded theoretical, simulated, or measured values |

Never present a simulated or theoretical value as a physical measurement.

## 2. Electrical quantities

Use explicit units with values.

Good:

`V = 4.98 V`
`I = 2.1 mA`
`R = 2.37 kΩ`
`P = 10.4 mW`

Avoid storing a bare number when the quantity is ambiguous.

Where practical, use SI units and clear prefixes:

- V, mV, kV
- A, mA, µA
- Ω, kΩ, MΩ
- W, mW

## 3. Calculations

Important calculations should record enough information to reproduce the result:

`Equation → Substitution → Units → Result`

Example:

`I = V/R`

`I = 5.00 V / 1.00 kΩ`

`I = 5.00 mA`

A calculator result without the equation is not considered a complete engineering record when the reasoning matters.

## 4. Measurements

When recording physical measurements, capture the instrument and conditions when they matter.

Recommended fields in a note or project record:

- instrument
- measurement point
- range or mode
- expected value
- measured value
- supply condition
- relevant component values
- date/time
- unusual observations

Do not alter a measured value to match a theoretical value.

## 5. Tolerances and uncertainty

A component value, measurement, or calculation may have uncertainty.

Record tolerance or uncertainty when it affects the conclusion.

Examples:

`10 kΩ ±5%`

`5.00 V ±0.02 V`

Do not imply more precision than the measurement supports.

## 6. Component records

Use the component's actual marking, manufacturer information, or datasheet whenever available.

For important components, record:

- part number
- manufacturer
- value/rating
- package
- purpose
- quantity
- datasheet URL
- physical location

Do not guess a component value from appearance when a datasheet or marking can verify it.

## 7. Schematics and wiring

A physical build should be reproducible from its documentation.

For circuits and projects, prefer recording:

- supply voltage
- ground/reference
- pin names/numbers
- component values
- relevant jumper/wire connections
- connector orientation
- polarity
- important protection components

Photographs are useful evidence but should not be the only record when an explicit schematic or connection list is practical.

## 8. Engineering software

Software behavior should be explainable and repeatable.

For calculations and deterministic tools:

- avoid hidden magic constants
- validate invalid input
- show units
- handle zero/division-by-zero cases
- avoid silently changing the user's values
- prefer deterministic output
- document assumptions

For stored engineering metrics, the database remains the source of truth.

## 9. Data integrity

The Lab follows these rules:

1. Do not use fake statistics as live data.
2. Do not silently replace missing data with believable numbers.
3. Preserve historical records when a mistake is resolved.
4. Prefer source records over duplicated summary values.
5. Use explicit relationships instead of copied labels where possible.
6. Validate ownership at the database layer.
7. Keep derived metrics mathematically defined in documentation.

## 10. Safety boundary

The Lab may document electronics work, calculations, tools, and experiments.

Engineering documentation must still identify relevant hazards when they materially affect a build, especially:

- mains or high voltage
- high current
- batteries
- heat
- rotating machinery
- lasers
- stored energy
- chemicals

The Lab is a record system; it does not replace appropriate safety procedures, datasheets, laboratory rules, or supervision.

## 11. Change discipline

For meaningful changes:

`Change → Verify → Document → Deploy`

A feature is not complete because the UI renders.

The minimum acceptable verification is:

- the application builds
- the intended workflow works
- saved data survives refresh
- destructive actions are intentional
- ownership rules remain correct
- documentation matches reality

## 12. Engineering notebook rule

A good record should allow a future version of yourself to understand:

- what you were trying to do
- what you expected
- what actually happened
- what you measured or observed
- what calculation/model you used
- what went wrong
- what you changed
- what you learned

That history is the long-term value of the Lab.
