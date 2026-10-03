# **Lessons learnt from building this project**
1. The state should live at the **lowest common component ancestor** which can fully serve all its consumers.

2. If the required data can be **derived from existing state/props** then don't create a state to represent the data because it leads to inconsistent and non-synchronized. Ex: products, filteredProducts.

3. Choose context instead of props when **multiple components** of the tree require the same state and when passing it **creates props drilling**.

4. When the reference state like **array or object is modified** then the **new reference** has to be passed to setter Fn to treat it as change by React.

5. Re-render is a Function call which creates new local variables every time but `useState and useRef` data persists across re-renders.

6. A component should have only single responsibility.