# Next.js Product Store

This project is a simple product management application built with Next.js. It allows users to view, add, update, and delete products through a user-friendly interface.

## Project Structure

- **src/components/ProductStore.tsx**: Contains the `ProductStore` component responsible for displaying and managing the product list. It uses state to store product information and provides functions for adding, removing, and updating products.

- **src/pages/api/products.ts**: Implements the API endpoint for managing products. It exports functions to handle requests for retrieving, adding, and deleting products.

- **src/pages/index.tsx**: The main page of the application. It imports the `ProductStore` component and displays it on the page.

- **src/hooks/useProductStore.ts**: Contains the custom hook `useProductStore`, which manages the product state and provides functions for interacting with the `ProductStore` component.

- **src/lib/product.ts**: Contains utility functions for working with products, such as functions for retrieving, adding, and deleting products from storage.

- **src/styles/globals.css**: Contains global styles for the application.

- **tsconfig.json**: Configuration file for TypeScript, defining compilation parameters and included files.

- **package.json**: Configuration file for npm, listing dependencies and scripts for the project.

- **next.config.js**: Contains configuration settings for Next.js.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd nextjs-product-component
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Features

- Add new products to the store.
- Update existing product details.
- Remove products from the store.
- View the list of products.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.