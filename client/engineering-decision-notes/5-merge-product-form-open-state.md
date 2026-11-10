## Context: Before this EDN the `formOpened` state was lived in a seperate context called `ProductFormOpenContext`.

# Problem: Redundancy of creating a new context for `formOpened` state because the `ProductFormContext` includes the form fields state and server validation state.

## Solution: `formOpened` state can be merged into `ProductFormContext`. So, that all the states related to ProductForm component can exists in `ProductFormContext`.

## Lesson: Before creating a context for a new state. Just find out if there is a context with the same responsibilty which is related to that particular state and put the state there.