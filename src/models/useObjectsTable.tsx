import slice from "lodash/slice";
import isEmpty from "lodash/isEmpty";
import { useState } from "react";

import { ISFObject, IMetadataStore } from "./MetadataStore";
import { removeSpaces } from "../helpers/utils";

export enum ObjectsViewOptions {
  All = "ALL",
  Only_Included = "ONLY_INCLUDED",
  Only_Excluded = "ONLY_EXCLUDED",
}

export interface IUseObjectsTableInput {
  store: IMetadataStore;
  searchText?: string;
  viewOption?: ObjectsViewOptions;
  pageSize?: number;
}

export interface IUseObjectsTableOutput {
  objects: ISFObject[];
  searchText: string;
  viewOption: ObjectsViewOptions;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalMatches: number;
  setViewOption: (option: ObjectsViewOptions) => void;
  setSearchText: (text: string) => void;
  setPageSize: (count: number) => void;
  setCurrentPage: (page: number) => void;
}

function search(searchText: string, objects: ISFObject[]): ISFObject[] {
  let result: ISFObject[] = [];
  const text = removeSpaces(searchText).toUpperCase();

  objects.forEach((object) => {
    const name = removeSpaces(object.name).toUpperCase();
    const label = removeSpaces(object.label).toUpperCase();

    if (name.includes(text) || label.includes(text)) result.push(object);
  });

  return result;
}

export function useObjectsTable({
  store,
  viewOption = ObjectsViewOptions.All,
  searchText = "",
  pageSize = 20,
}: IUseObjectsTableInput): IUseObjectsTableOutput {
  let objects: ISFObject[] = [];
  const [searchTextState, setSearchText] = useState(searchText);
  const [pageSizeState, setPageSize] = useState(pageSize);
  const [currentPageState, setCurrentPage] = useState(1);
  const [viewOptionState, setViewOption] = useState<ObjectsViewOptions>(viewOption);

  switch (viewOptionState) {
    case ObjectsViewOptions.All:
      objects = store.listAll;
      break;
    case ObjectsViewOptions.Only_Included:
      objects = store.selectedObjects;
      break;
    case ObjectsViewOptions.Only_Excluded:
      objects = store.excludedObjects;
      break;
  }

  let totalMatches = 0;
  if (!isEmpty(searchTextState)) {
    objects = search(searchTextState, objects);
    totalMatches = objects.length;
  } else {
    totalMatches = 0;
  }

  const totalPages = Math.ceil(objects.length / pageSizeState);

  let size = objects.length;
  if (size > 0) {
    let currentPage = currentPageState;
    if (currentPageState > totalPages || currentPageState < 1) {
      currentPage = Math.max(totalPages, 1);
      setCurrentPage(currentPage);
    }
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = startIndex + pageSize;
    if (endIndex > totalPages * pageSize) endIndex = totalPages * pageSize;
    objects = slice(objects, startIndex, endIndex);
  }

  return {
    objects,
    searchText: searchTextState,
    setSearchText,
    pageSize: pageSizeState,
    setPageSize,
    viewOption: viewOptionState,
    setViewOption,
    currentPage: currentPageState,
    setCurrentPage,
    totalPages,
    totalMatches,
  };
}
