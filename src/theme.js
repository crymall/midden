import {
  createTheme,
  AppShell,
  Button,
  Tabs,
  Table,
  Badge,
  Select,
  ActionIcon,
  Title,
  Text,
} from "@mantine/core";

export const win95Theme = createTheme({
  fontFamily: '"MS Sans Serif", Arial, sans-serif',
  headings: { fontFamily: '"MS Sans Serif", Arial, sans-serif' },
  primaryColor: "gray",
  autoContrast: true,
  components: {
    AppShell: AppShell.extend({
      styles: {
        main: {
          backgroundColor: "#008080",
          color: "black",
        },
        header: {
          backgroundColor: "#c0c0c0",
          borderBottom: "2px solid #000",
          borderTop: "2px solid #fff",
        },
      },
    }),
    Button: Button.extend({
      defaultProps: { radius: 0, color: "gray", c: "black" },
      styles: {
        root: {
          backgroundColor: "#c0c0c0",
          borderTop: "2px solid #fff",
          borderLeft: "2px solid #fff",
          borderRight: "2px solid #000",
          borderBottom: "2px solid #000",
          color: "black",
          transition: "none",
          "&:hover": { backgroundColor: "#c0c0c0" },
          "&:active": {
            borderTop: "2px solid #000",
            borderLeft: "2px solid #000",
            borderRight: "2px solid #fff",
            borderBottom: "2px solid #fff",
            transform: "none",
          },
        },
        label: { fontWeight: "bold" },
      },
    }),
    Tabs: Tabs.extend({
      defaultProps: { radius: 0 },
      styles: {
        list: {
          borderBottom: "none",
          gap: "2px",
        },
        tab: {
          backgroundColor: "#c0c0c0",
          borderTop: "2px solid #fff",
          borderLeft: "2px solid #fff",
          borderRight: "2px solid #000",
          borderBottom: "2px solid #000",
          marginBottom: "-2px",
          color: "black",
          "&[data-active]": {
            borderBottom: "none",
            paddingBottom: "calc(var(--mantine-spacing-xs) + 2px)",
            marginTop: "-2px",
            zIndex: 2,
          },
          "&:hover": { backgroundColor: "#c0c0c0" },
        },
        panel: {
          backgroundColor: "#c0c0c0",
          borderTop: "2px solid #fff",
          borderLeft: "2px solid #fff",
          borderRight: "2px solid #000",
          borderBottom: "2px solid #000",
          padding: "16px",
          minHeight: "400px",
        },
      },
    }),
    Table: Table.extend({
      styles: {
        table: {
          backgroundColor: "white",
          outline: "2px solid #808080",
        },
        th: {
          backgroundColor: "#c0c0c0",
          borderBottom: "1px solid #000",
          borderRight: "1px solid #000",
          color: "black",
          borderRadius: 0,
        },
        td: {
          borderBottom: "1px dotted #000",
          color: "black",
        },
      },
    }),
    Badge: Badge.extend({
      defaultProps: { radius: 0 },
      styles: {
        root: {
          border: "1px solid #000",
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    }),
    Select: Select.extend({
      defaultProps: { radius: 0 },
      styles: {
        input: {
          backgroundColor: "white",
          borderTop: "2px solid #808080",
          borderLeft: "2px solid #808080",
          borderRight: "2px solid #fff",
          borderBottom: "2px solid #fff",
          color: "black",
        },
        dropdown: {
          border: "2px solid #000",
          borderRadius: 0,
        },
        option: {
          borderRadius: 0,
          "&[data-checked]": {
            backgroundColor: "#000080",
            color: "white",
          },
          "&[data-hovered]": {
            backgroundColor: "#000080",
            color: "white",
          },
        },
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { radius: 0, variant: "transparent" },
      styles: {
        root: {
          color: "black",
          "&:hover": { backgroundColor: "transparent" },
        },
      },
    }),
    Title: Title.extend({
      styles: {
        root: {
          fontFamily: '"MS Sans Serif", Arial, sans-serif',
        },
      },
    }),
    Text: Text.extend({
      styles: {
        root: {
          fontFamily: '"MS Sans Serif", Arial, sans-serif',
        },
      },
    }),
  },
});
