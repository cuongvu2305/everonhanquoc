const colors = {
  brand: {
    primary: "#16842c",
    primaryDark: "#0f6321",
    primarySoft: "#eaf6ed",
    accent: "#d71920",
    accentSoft: "#fde9e9",
  },
  neutral: {
    page: "#f5faf5",
    surface: "#ffffff",
    text: "#243126",
    muted: "#657268",
    border: "#d9e5dc",
  },
};

export const globalTheme = {
  token: {
    borderRadius: 6,
    colorPrimary: colors.brand.primary,
    colorInfo: colors.brand.primary,
    colorSuccess: colors.brand.primary,
    colorError: colors.brand.accent,
    colorText: colors.neutral.text,
    colorTextSecondary: colors.neutral.muted,
    colorBorder: colors.neutral.border,
    colorBgLayout: colors.neutral.page,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  components: {
    Button: {
      controlHeight: 38,
    },
    Menu: {
      itemBorderRadius: 0,
    },
    Card: {
      borderRadiusLG: 6,
    },
  },
};
