# **Lessons learnt from building this project**
1. The state should live at the **lowest common component ancestor** which can fully serve all its consumers.
2. If the required data can be derived from existing state/props then don't create a state to represent the data because it leads to inconsistent and non-synchronized. Ex: products, filteredProducts.