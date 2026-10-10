import { useMemo, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";
import ProductForm from "../components/ProductForm.jsx";
import ProductsView from "../components/ProductsView.jsx";
import Header from "../components/Header.jsx";

function App() {
    const [products, setProducts] = useState([
        {
            id: 101,
            name: "Wireless Mouse",
            price: 799,
            category: "Electronics",
            description: "Ergonomic wireless mouse with adjustable DPI.",
            stockQuantity: 25,
            isExists: true
        },
        {
            id: 102,
            name: "Mechanical Keyboard",
            price: 2499,
            category: "Electronics",
            description: "RGB mechanical keyboard with blue switches.",
            stockQuantity: 12,
            isExists: true
        },
        {
            id: 103,
            name: "Webcam",
            price: 1899,
            category: "Electronics",
            description: "Full HD webcam for online meetings and video calls.",
            stockQuantity: 18,
            isExists: true
        },
        {
            id: 104,
            name: "Gaming Monitor",
            price: 12999,
            category: "Electronics",
            description: "24-inch Full HD monitor with a 144Hz refresh rate.",
            stockQuantity: 8,
            isExists: true
        },
        {
            id: 105,
            name: "USB Microphone",
            price: 1599,
            category: "Audio",
            description: "USB condenser microphone for recording and streaming.",
            stockQuantity: 15,
            isExists: true
        },
        {
            id: 106,
            name: "Wireless Headphones",
            price: 2199,
            category: "Audio",
            description: "Over-ear wireless headphones with noise isolation.",
            stockQuantity: 20,
            isExists: true
        },
        {
            id: 107,
            name: "Desktop Speakers",
            price: 1299,
            category: "Audio",
            description: "Stereo speakers with clear sound and volume control.",
            stockQuantity: 14,
            isExists: true
        },
        {
            id: 108,
            name: "Wired Earphones",
            price: 499,
            category: "Audio",
            description: "Lightweight wired earphones with an in-line microphone.",
            stockQuantity: 30,
            isExists: true
        },
        {
            id: 109,
            name: "External SSD",
            price: 4999,
            category: "Storage",
            description: "Portable 500GB SSD for fast file transfers and backups.",
            stockQuantity: 10,
            isExists: true
        },
        {
            id: 110,
            name: "USB Flash Drive",
            price: 599,
            category: "Storage",
            description: "64GB USB flash drive for storing documents and media.",
            stockQuantity: 40,
            isExists: true
        },
        {
            id: 111,
            name: "External Hard Drive",
            price: 4299,
            category: "Storage",
            description: "1TB portable hard drive for data backups and storage.",
            stockQuantity: 9,
            isExists: true
        },
        {
            id: 112,
            name: "USB-C Hub",
            price: 1499,
            category: "Connectivity",
            description: "Multiport USB-C hub with USB-A, HDMI, and card reader ports.",
            stockQuantity: 16,
            isExists: true
        },
        {
            id: 113,
            name: "Ethernet Adapter",
            price: 699,
            category: "Connectivity",
            description: "USB-to-Ethernet adapter for a stable wired internet connection.",
            stockQuantity: 22,
            isExists: true
        },
        {
            id: 114,
            name: "Bluetooth Adapter",
            price: 399,
            category: "Connectivity",
            description: "Compact USB Bluetooth adapter for connecting wireless devices.",
            stockQuantity: 28,
            isExists: true
        },
        {
            id: 115,
            name: "HDMI Cable",
            price: 349,
            category: "Connectivity",
            description: "2-meter HDMI cable for connecting monitors and displays.",
            stockQuantity: 35,
            isExists: true
        },
        {
            id: 116,
            name: "Laptop Stand",
            price: 999,
            category: "Accessories",
            description: "Adjustable laptop stand designed for comfortable viewing.",
            stockQuantity: 17,
            isExists: true
        },
        {
            id: 117,
            name: "Mouse Pad",
            price: 299,
            category: "Accessories",
            description: "Non-slip mouse pad with a smooth tracking surface.",
            stockQuantity: 45,
            isExists: true
        },
        {
            id: 118,
            name: "Laptop Backpack",
            price: 1499,
            category: "Accessories",
            description: "Padded backpack with compartments for a laptop and accessories.",
            stockQuantity: 13,
            isExists: true
        },
        {
            id: 119,
            name: "Surge Protector",
            price: 899,
            category: "Power",
            description: "Power strip with surge protection and multiple outlets.",
            stockQuantity: 19,
            isExists: true
        },
        {
            id: 120,
            name: "UPS Battery Backup",
            price: 3499,
            category: "Power",
            description: "Compact UPS that provides temporary backup power for a computer.",
            stockQuantity: 7,
            isExists: true
        }
    ]);

    const [productForm, setProductForm] = useState({
        id: 0,
        name: '',
        price: 0,
        category: '',
        description: '',
        stockQuantity: 0,
        isExists: false
    });

    const productsContextValue = useMemo(() => {
        return { products, setProducts };
    }, [products]);

    const productFormContextValue = useMemo(() => {
        return { productForm, setProductForm };
    }, [productForm]);

    return (
        <ProductsContext value={productsContextValue}>
            <ProductFormContext value={productFormContextValue}>
                <Header></Header>
                {/* <ProductForm></ProductForm> */}
                <ProductsView></ProductsView>
            </ProductFormContext>
        </ProductsContext>
    );
}

export default App;
