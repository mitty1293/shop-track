import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/client';

const ItemsList: React.FC = () => {
    const { data: products, isLoading, isError, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (isError) {
        return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
    }

    return (
        <div>
            <h1>Products</h1>
            {(!products || products.length === 0) ? (
                <p>The product has not yet been registered.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Unit</th>
                            <th>Manufacturer</th>
                            <th>Origin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.category.name}</td>
                                <td>{product.unit.name}</td>
                                <td>{product.manufacturer ? product.manufacturer.name : 'N/A'}</td>
                                <td>{product.origin ? product.origin.name : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ItemsList;
