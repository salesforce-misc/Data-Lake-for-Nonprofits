import slice from "lodash/slice";
import isEmpty from "lodash/isEmpty";
import { useState } from "react";

import { IField, ISFObject } from "./MetadataStore";
import { removeSpaces } from "../helpers/utils";

export enum FieldsViewOptions {
  All = "ALL",
  Only_Included = "ONLY_INCLUDED",
  Only_Excluded = "ONLY_EXCLUDED",
}

export interface IUseFieldsTableInput {
  object: ISFObject;
  searchText?: string;
  viewOption?: FieldsViewOptions;
  pageSize?: number;
}

export interface IUseFieldsTableOutput {
  fields: IField[];
  searchText: string;
  viewOption: FieldsViewOptions;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalMatches: number;
  setViewOption: (option: FieldsViewOptions) => void;
  setSearchText: (text: string) => void;
  setPageSize: (count: number) => void;
  setCurrentPage: (page: number) => void;
}

function search(searchText: string, fields: IField[]): IField[] {
  let result: IField[] = [];
  const text = removeSpaces(searchText).toUpperCase();

  fields.forEach((field) => {
    const name = removeSpaces(field.name).toUpperCase();
    const label = removeSpaces(field.label).toUpperCase();

    if (name.includes(text) || label.includes(text)) result.push(field);
  });

  return result;
}

export function useFieldsTable({
  object,
  viewOption = FieldsViewOptions.All,
  searchText = "",
  pageSize = 20,
}: IUseFieldsTableInput): IUseFieldsTableOutput {
  let fields: IField[] = [];
  const [searchTextState, setSearchText] = useState(searchText);
  const [pageSizeState, setPageSize] = useState(pageSize);
  const [currentPageState, setCurrentPage] = useState(1);
  const [viewOptionState, setViewOption] = useState<FieldsViewOptions>(viewOption);

  switch (viewOptionState) {
    case FieldsViewOptions.All:
      fields = object.selectableFields;
      break;
    case FieldsViewOptions.Only_Included:
      fields = object.userSelectedFields;
      break;
    case FieldsViewOptions.Only_Excluded:
      fields = object.excludedFields;
      break;
  }

  let totalMatches = 0;
  if (!isEmpty(searchTextState)) {
    fields = search(searchTextState, fields);
    totalMatches = fields.length;
  } else {
    totalMatches = 0;
  }

  const totalPages = Math.ceil(fields.length / pageSizeState);

  let size = fields.length;
  if (size > 0) {
    let currentPage = currentPageState;
    if (currentPageState > totalPages || currentPageState < 1) {
      currentPage = Math.max(totalPages, 1);
      setCurrentPage(currentPage);
    }
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = startIndex + pageSize;
    if (endIndex > totalPages * pageSize) endIndex = totalPages * pageSize;
    fields = slice(fields, startIndex, endIndex);
  }

  return {
    fields,
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
