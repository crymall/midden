import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Field,
  Label,
  Input,
  Textarea,
  Popover,
  PopoverButton,
  PopoverPanel,
  Checkbox,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import useData from "../../context/data/useData";
import MiddenCard from "../../components/MiddenCard";
import MiddenModal from "../../components/MiddenModal";

const NewRecipe = () => {
  const navigate = useNavigate();
  const {
    tags,
    getTags,
    createRecipe,
    createTag,
    createIngredient,
    getIngredients,
    ingredients: searchResults,
  } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prep_time_minutes: "",
    cook_time_minutes: "",
    servings: "",
    instructions: "",
  });

  const [ingredients, setIngredients] = useState([
    { id: null, name: "", quantity: "", unit: "", notes: "" },
  ]);

  const [selectedTags, setSelectedTags] = useState([]);

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [pendingIngredientName, setPendingIngredientName] = useState("");
  const [pendingIngredientIndex, setPendingIngredientIndex] = useState(null);

  const handleSearchIngredients = (query) => {
    if (!query) {
      getIngredients(50);
      return;
    }
    getIngredients(10, 0, query);
  };

  useEffect(() => {
    getTags();
    getIngredients(50);
  }, [getTags, getIngredients]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: null, name: "", quantity: "", unit: "", notes: "" },
    ]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleOpenTagModal = () => {
    setNewTagName("");
    setIsTagModalOpen(true);
  };

  const handleConfirmCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const newTag = await createTag(newTagName);
      setSelectedTags((prev) => [...prev, newTag.id]);
      setNewTagName("");
      setIsTagModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenIngredientModal = (name, index) => {
    setPendingIngredientName(name);
    setPendingIngredientIndex(index);
    setIsIngredientModalOpen(true);
  };

  const handleConfirmCreateIngredient = async () => {
    try {
      const newIng = await createIngredient(pendingIngredientName);
      if (pendingIngredientIndex !== null) {
        const newIngredients = [...ingredients];
        newIngredients[pendingIngredientIndex] = {
          ...newIngredients[pendingIngredientIndex],
          id: newIng.id,
          name: newIng.name,
        };
        setIngredients(newIngredients);
      }
      setIsIngredientModalOpen(false);
      setPendingIngredientName("");
      setPendingIngredientIndex(null);
      getIngredients(50);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      prep_time_minutes: Number(formData.prep_time_minutes),
      cook_time_minutes: Number(formData.cook_time_minutes),
      servings: Number(formData.servings),
      ingredients: ingredients.filter((i) => i.name.trim() !== ""),
      tags: selectedTags,
    };

    try {
      const response = await createRecipe(payload);
      const newId = response.data?.id || response.id;
      navigate(`/applications/canteen/recipes/${newId}`);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to create recipe. Please check your inputs and try again.",
      );
      setLoading(false);
    }
  };

  const baseInputClass =
    "bg-dark border-grey text-lightestGrey focus:border-lightestGrey border p-2 focus:outline-none";

  return (
    <MiddenCard>
      <h2 className="mb-4 font-gothic text-4xl font-bold text-white">
        New Recipe
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="border border-red-500 bg-red-900/50 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Field className="md:col-span-2">
            <Label className="text-lightestGrey mb-1 block text-sm font-bold">
              Title
            </Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`${baseInputClass} w-full`}
            />
          </Field>

          <Field className="md:col-span-2">
            <Label className="text-lightestGrey mb-1 block text-sm font-bold">
              Description
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`${baseInputClass} w-full`}
            />
          </Field>

          <Field>
            <Label className="text-lightestGrey mb-1 block text-sm font-bold">
              Prep Time (minutes)
            </Label>
            <Input
              type="number"
              name="prep_time_minutes"
              value={formData.prep_time_minutes}
              onChange={handleChange}
              className={`${baseInputClass} w-full`}
              min="0"
            />
          </Field>

          <Field>
            <Label className="text-lightestGrey mb-1 block text-sm font-bold">
              Cook Time (minutes)
            </Label>
            <Input
              type="number"
              name="cook_time_minutes"
              value={formData.cook_time_minutes}
              onChange={handleChange}
              className={`${baseInputClass} w-full`}
              min="0"
            />
          </Field>

          <Field>
            <Label className="text-lightestGrey mb-1 block text-sm font-bold">
              Servings
            </Label>
            <Input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              className={`${baseInputClass} w-full`}
              min="0"
              step="any"
            />
          </Field>

          <Field>
            <Label className="text-lightestGrey mb-1 block text-sm font-bold">
              Tags
            </Label>
            <Popover className="relative">
              <PopoverButton className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey flex w-full items-center justify-between border p-2 text-left focus:outline-none">
                <span className="truncate">
                  {selectedTags.length === 0
                    ? "Select tags..."
                    : `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""} selected`}
                </span>
                <span className="ml-2">▼</span>
              </PopoverButton>
              <PopoverPanel className="bg-dark border-grey absolute z-10 mt-1 max-h-60 w-full overflow-auto border p-2 shadow-xl">
                <div className="flex flex-col gap-2">
                  {tags.map((tag) => (
                    <Field
                      key={tag.id}
                      className="text-lightestGrey flex cursor-pointer items-center gap-2 hover:text-white"
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="group border-grey bg-dark data-checked:bg-accent data-checked:border-accent block size-4 border transition-colors"
                      >
                        <svg
                          className="stroke-white opacity-0 group-data-checked:opacity-100"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M3 8L6 11L11 3.5"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Checkbox>
                      <Label className="cursor-pointer font-mono text-sm">
                        {tag.name}
                      </Label>
                    </Field>
                  ))}
                  <div className="border-grey mt-2 border-t pt-2">
                    <Button
                      onClick={handleOpenTagModal}
                      className="text-accent w-full text-left text-sm font-bold hover:text-white"
                    >
                      + Create new tag
                    </Button>
                  </div>
                </div>
              </PopoverPanel>
            </Popover>
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lightestGrey block text-sm font-bold">
              Ingredients
            </span>
            <Button
              type="button"
              onClick={addIngredient}
              className="text-accent text-sm font-bold hover:text-white"
            >
              + Add Ingredient
            </Button>
          </div>
          <div className="flex flex-col md:gap-2">
            {ingredients.map((ing, index) => (
              <div
                key={index}
                className="border-grey/30 flex items-stretch gap-2 border-b py-4 last:border-0 md:border-0 md:py-0"
              >
                <div className="flex flex-1 flex-wrap gap-2 md:flex-nowrap">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val < 0) return;
                      handleIngredientChange(
                        index,
                        "quantity",
                        val === "0" ? "" : val,
                      );
                    }}
                    className={`${baseInputClass} w-20 flex-none`}
                  />
                  <Input
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    className={`${baseInputClass} w-24 flex-none`}
                  />
                  <div className="relative min-w-25 flex-1">
                    <Combobox
                      value={ing}
                      onChange={async (val) => {
                        if (
                          typeof val === "object" &&
                          val?.action === "create"
                        ) {
                          handleOpenIngredientModal(val.name, index);
                        } else if (val) {
                          const newIngredients = [...ingredients];
                          newIngredients[index] = {
                            ...newIngredients[index],
                            id: val.id,
                            name: val.name,
                          };
                          setIngredients(newIngredients);
                        }
                      }}
                      immediate
                      by={(a, b) => a?.id === b?.id}
                    >
                      <ComboboxInput
                        className={`${baseInputClass} w-full`}
                        placeholder="Name"
                        displayValue={(item) => item?.name || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newIngredients = [...ingredients];
                          newIngredients[index] = {
                            ...newIngredients[index],
                            name: val,
                            id: null,
                          };
                          setIngredients(newIngredients);
                          handleSearchIngredients(val);
                        }}
                        onFocus={() => handleSearchIngredients(ing.name)}
                      />
                      {(searchResults.length > 0 ||
                        ((ing.name || "").trim() !== "" &&
                          !searchResults.some(
                            (r) =>
                              r.name.toLowerCase() ===
                              (ing.name || "").toLowerCase(),
                          ))) && (
                        <ComboboxOptions className="bg-dark border-grey absolute z-50 mt-1 max-h-60 w-full overflow-auto border p-1 shadow-xl">
                          {searchResults.map((suggestion) => (
                            <ComboboxOption
                              key={suggestion.id}
                              value={suggestion}
                              className="data-focus:bg-accent text-lightestGrey cursor-pointer px-4 py-2 select-none data-focus:text-white"
                            >
                              {suggestion.name}
                            </ComboboxOption>
                          ))}
                          {(ing.name || "").trim() !== "" &&
                            !searchResults.some(
                              (r) =>
                                r.name.toLowerCase() ===
                                (ing.name || "").toLowerCase(),
                            ) && (
                              <ComboboxOption
                                value={{ action: "create", name: ing.name }}
                                className="data-focus:bg-accent text-lightestGrey cursor-pointer px-4 py-2 font-bold italic select-none data-focus:text-white"
                              >
                                Create "{ing.name}"
                              </ComboboxOption>
                            )}
                        </ComboboxOptions>
                      )}
                    </Combobox>
                  </div>
                  <Input
                    placeholder="Notes"
                    value={ing.notes}
                    onChange={(e) =>
                      handleIngredientChange(index, "notes", e.target.value)
                    }
                    className={`${baseInputClass} w-full flex-none md:w-1/2`}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="flex items-center justify-center px-2 font-bold text-red-400 hover:text-red-200"
                  disabled={ingredients.length === 1}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Field>
          <Label className="text-lightestGrey mb-1 block text-sm font-bold">
            Instructions
          </Label>
          <Textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={10}
            className={`${baseInputClass} w-full`}
            placeholder="Step 1: ..."
          />
        </Field>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="text-lightGrey px-4 py-2 font-bold transition-colors hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent/80 px-6 py-2 font-bold text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Recipe"}
          </Button>
        </div>
      </form>

      <MiddenModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        title="Create New Tag"
      >
            <div className="flex flex-col gap-4">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className={`${baseInputClass} w-full`}
                placeholder="Tag Name"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setIsTagModalOpen(false)}
                  className="text-lightGrey px-4 py-2 font-bold hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmCreateTag}
                  className="bg-accent hover:bg-accent/80 px-4 py-2 font-bold text-white"
                >
                  Create
                </Button>
              </div>
            </div>
      </MiddenModal>

      <MiddenModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        title="Create Ingredient"
      >
            <p className="text-lightestGrey mb-6 font-mono">
              Are you sure you want to create the ingredient{" "}
              <span className="text-accent font-bold">
                "{pendingIngredientName}"
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setIsIngredientModalOpen(false)}
                className="text-lightGrey px-4 py-2 font-bold hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCreateIngredient}
                className="bg-accent hover:bg-accent/80 px-4 py-2 font-bold text-white"
              >
                Create
              </Button>
            </div>
      </MiddenModal>
    </MiddenCard>
  );
};

export default NewRecipe;
