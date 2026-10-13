import { ProductsProvider } from "../context/ProductsContext.jsx";
import { ProductFormProvider } from "../context/ProductFormContext.jsx";
import { ProductFormOpenProvider, useProductFormOpen } from "../context/ProductFormOpenContext.jsx";

import Header from "../components/Header.jsx";
import ProductForm from "../components/ProductForm.jsx";
import ProductsView from "../components/ProductsView.jsx";

function App() {
    return (
        <ProductsProvider>
            <ProductFormProvider>
                <ProductFormOpenProvider>
                    <Header></Header>
                    <ProductForm></ProductForm>
                    <ProductsView></ProductsView>
                </ProductFormOpenProvider>
            </ProductFormProvider>
        </ProductsProvider>
    );
}

export default App;
