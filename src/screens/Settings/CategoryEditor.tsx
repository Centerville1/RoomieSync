import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { categoryService } from "../../services/categoryService";
import { Category } from "../../types";
import { useUserTheme } from "../../hooks/useUserTheme";
interface CategoryEditorProps {
  houseId: string;
}

const COLOR_OPTIONS = [
  "#E76464",
  "#E55555",
  "#E24444",
  "#DF3131",
  "#E4783F",
  "#F1B347",
  "#EDC54B",
  "#EAD84E",
  "#BBCF58",
  "#5BBE6C",
  "#5BB383",
  "#5AA799",
  "#5A9BAF",
  "#598FC5",
  "#5E72E4",
  "#7071E3",
  "#826FE2",
  "#A56BDF",
  "#9552D7",
  "#8439CE",
  "#9C3AC8",
  "#B33BC1",
  "#CB3CBA",
  "#D53776",
  "#6B7280",
];

const CategoryEditor: React.FC<CategoryEditorProps> = ({ houseId }) => {
  const { COLORS } = useUserTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#6B7280",
    icon: "",
    description: "",
  });
  const [editValues, setEditValues] = useState<{
    [id: string]: Partial<Category>;
  }>({});
  const [showColorPickerFor, setShowColorPickerFor] = useState<string | null>(
    null
  );
  const [showNewColorPicker, setShowNewColorPicker] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [houseId]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const cats = await categoryService.getCategoriesByHouseId(houseId);
      setCategories(cats);
    } catch (err) {
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    setLoading(true);
    try {
      await categoryService.createCategory(houseId, newCategory);
      setNewCategory({ name: "", color: "#6B7280", icon: "", description: "" });
      fetchCategories();
    } catch (err) {
      Alert.alert("Error", "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    const values = editValues[id];
    if (!values || !values.name?.trim()) return;
    setLoading(true);
    try {
      await categoryService.updateCategory(houseId, id, values);
      setEditingId(null);
      setEditValues((prev) => ({ ...prev, [id]: {} }));
      fetchCategories();
    } catch (err) {
      Alert.alert("Error", "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await categoryService.deleteCategory(houseId, id);
              fetchCategories();
            } catch (err) {
              Alert.alert("Error", "Failed to delete category");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: COLORS.CARD_BACKGROUND }]}>
      <Text style={[styles.cardTitle, { color: COLORS.TEXT_PRIMARY }]}>📊 House Categories</Text>
      <Text style={[styles.sectionDescription, { color: COLORS.TEXT_SECONDARY }]}>
        Manage categories for organizing expenses and shopping items.
      </Text>
      {/* Add Category */}
      <View style={styles.inputRow}>
        {/* Color swatch for new category, click to show picker */}
        <TouchableOpacity
          style={[styles.colorSwatch, { backgroundColor: newCategory.color }]}
          onPress={() => setShowNewColorPicker((v) => !v)}
          activeOpacity={0.7}
        />
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.BACKGROUND, color: COLORS.TEXT_PRIMARY, borderColor: COLORS.BORDER_LIGHT }]}
          placeholder="New category name"
          value={newCategory.name}
          onChangeText={(text) => setNewCategory((c) => ({ ...c, name: text }))}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#FF6B35" + "20" }]}
          onPress={handleAddCategory}
          disabled={loading}
        >
          <Ionicons name="add" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>
      {/* New Category Color Picker, only visible if swatch clicked */}
      {showNewColorPicker && (
        <View style={styles.colorPickerRow}>
          {COLOR_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                newCategory.color === color && styles.selectedSwatch,
              ]}
              onPress={() => {
                setNewCategory((c) => ({ ...c, color }));
                setShowNewColorPicker(false);
              }}
            />
          ))}
        </View>
      )}
      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryRow}>
            {editingId === item.id ? (
              <>
                <View style={styles.editCategoryColumn}>
                  <View style={styles.categoryRow}>
                    {/* Color swatch, clickable to show color picker */}
                    <TouchableOpacity
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor:
                            editValues[item.id]?.color || item.color,
                        },
                      ]}
                      onPress={() =>
                        setShowColorPickerFor((prev) =>
                          prev === item.id ? null : item.id
                        )
                      }
                      activeOpacity={0.7}
                    />
                    <TextInput
                      style={[styles.input, { backgroundColor: COLORS.BACKGROUND, color: COLORS.TEXT_PRIMARY, borderColor: COLORS.BORDER_LIGHT }]}
                      value={editValues[item.id]?.name ?? item.name}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], name: text },
                        }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => {
                        setShowColorPickerFor(null);
                        handleEditCategory(item.id);
                      }}
                      disabled={loading}
                    >
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color="#10B981"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditingId(null);
                        setShowColorPickerFor(null);
                      }}
                    >
                      <Ionicons name="close" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  {/* Color picker for editing, only visible if swatch clicked */}
                  {showColorPickerFor === item.id && (
                    <View style={styles.colorPickerRow}>
                      {COLOR_OPTIONS.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: color },
                            editValues[item.id]?.color === color &&
                              styles.selectedSwatch,
                          ]}
                          onPress={() => {
                            setEditValues((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], color },
                            }));
                            setShowColorPickerFor(null);
                          }}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                {/* Color swatch, clickable to show color picker */}
                <TouchableOpacity
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: editValues[item.id]?.color || item.color,
                    },
                  ]}
                  activeOpacity={0.7}
                />
                <Text style={[styles.categoryName, { color: COLORS.TEXT_PRIMARY }]}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setEditingId(item.id);
                    setEditValues((prev) => ({
                      ...prev,
                      [item.id]: { name: item.name, color: item.color },
                    }));
                  }}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#FF6B35"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(item.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#EF4444"
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: COLORS.TEXT_SECONDARY }]}>No categories yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  addButton: {
    borderRadius: 8,
    padding: 8,
  },
  colorPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 4,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    marginRight: 4,
    marginBottom: 4,
  },
  selectedSwatch: {
    borderColor: "#FF6B35",
    borderWidth: 2,
  },
  editCategoryColumn: {
    flexDirection: "column",
    flex: 1,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  deleteButton: {
    marginLeft: 4,
    padding: 4,
  },
  saveButton: {
    marginLeft: 8,
    padding: 4,
  },
  cancelButton: {
    marginLeft: 4,
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
});

export default CategoryEditor;
