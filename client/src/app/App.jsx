import { ProductsProvider } from "../context/ProductsContext.jsx";
import { ProductFormProvider } from "../context/ProductFormContext.jsx";

import Header from "../components/Header.jsx";
import ProductForm from "../components/ProductForm.jsx";
import ProductsView from "../components/ProductsView.jsx";

function App() {
    return (
        <ProductsProvider>
            <ProductFormProvider>
                <Header></Header>
                <ProductForm></ProductForm>
                <ProductsView></ProductsView>
            </ProductFormProvider>
        </ProductsProvider>
    );
}

export default App;
