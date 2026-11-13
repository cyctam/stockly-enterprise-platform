import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SearchFilterBar from "../components/SearchFilterBar";
import StateCard from "../components/StateCard";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableEmptyState,
} from "../components/ui/Table";
import { inventoryService } from "../services/inventoryService";
import {
  formatDateTime,
  formatQuantity,
  formatStockStatus,
} from "../utils/formatters";

const STATUS_OPTIONS = ["Healthy", "Low Stock", "Critical"];

export default function MaterialsList() {
  const [materialsData, setMaterialsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getMaterials();
      setMaterialsData(data || []);
      setIsError(false);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const categories = useMemo(() => {
    const set = new Set((materialsData || []).map((item) => item.category));
    return Array.from(set).sort();
  }, [materialsData]);

  const filteredMaterials = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return (materialsData || []).filter((material) => {
      const status = material.status || formatStockStatus(material.currentStock, material.minStock);
      const matchesSearch = !query || material.name.toLowerCase().includes(query) || material.category.toLowerCase().includes(query);
      const matchesStatus = !statusValue || status === statusValue;
      const matchesCategory = !categoryValue || material.category === categoryValue;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [materialsData, searchValue, statusValue, categoryValue]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materials Inventory"
        description="Manage material availability, stock levels, and reorder signals across factories."
        actions={
          <>
            <Button variant="secondary">Export list</Button>
            <Link to="/purchase-requests/new">
              <Button>Create request</Button>
            </Link>
          </>
        }
      />

      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusValue={statusValue}
        onStatusChange={setStatusValue}
        categoryValue={categoryValue}
        onCategoryChange={setCategoryValue}
        statusOptions={STATUS_OPTIONS}
        categoryOptions={categories}
      />

      {loading && <StateCard />}

      {isError && (
        <StateCard
          variant="error"
          actionLabel="Retry loading"
          onAction={fetchMaterials}
        />
      )}

      {!loading && !isError && (
        <Card>
          <CardHeader
            title="Material roster"
            subtitle={`${filteredMaterials.length} items matching current filters`}
            actions={
              <div className="text-xs text-slate-500">
                Last sync: {formatDateTime(new Date().toISOString())}
              </div>
            }
          />
          <CardBody className="p-0">
            <Table className="shadow-none border-none">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Material</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Current stock</TableHeaderCell>
                  <TableHeaderCell>Minimum stock</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Last updated</TableHeaderCell>
                  <TableHeaderCell className="text-right">Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <TableEmptyState
                        title="No materials found"
                        description="Adjust your search or filter settings to find materials."
                        action={
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSearchValue("");
                              setStatusValue("");
                              setCategoryValue("");
                            }}
                          >
                            Reset filters
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => {
                    const status = material.status || formatStockStatus(material.currentStock, material.minStock);

                    return (
                      <TableRow key={material.id}>
                        <TableCell className="font-semibold text-slate-900">
                          <Link to={`/materials/${material.id}`} className="hover:text-slate-900">
                            {material.name}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">{material.id}</p>
                        </TableCell>
                        <TableCell>{material.category}</TableCell>
                        <TableCell>
                          {formatQuantity(material.currentStock, material.unit)}
                        </TableCell>
                        <TableCell>
                          {formatQuantity(material.minStock, material.unit)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell>
                          {formatDateTime(material.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/materials/${material.id}`}>
                            <Button variant="ghost">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}