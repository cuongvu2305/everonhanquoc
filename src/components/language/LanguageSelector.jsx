const LANGUAGES = {
  vi: { value: "vi", label: "VI" },
  en: { value: "en", label: "EN" },
};

function LanguageSelector({ value, onChange }) {
  return (
    <Segmented
      className="language-selector"
      value={value}
      onChange={onChange}
      options={Object.values(LANGUAGES).map((language) => ({
        value: language.value,
        label: <Text strong>{language.label}</Text>,
      }))}
    />
  );
}
