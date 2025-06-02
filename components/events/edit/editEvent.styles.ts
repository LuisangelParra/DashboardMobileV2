import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#FF453A',
    marginTop: 4,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Imagen
  imagePreviewContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadButton: {
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Inputs generales
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  // Input simple (TextField)
  textFieldInput: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  
  // TextArea
  textAreaInput: {
    minHeight: 100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        fontFamily: 'system-ui',
      },
    }),
  },
  
  // Input con ícono (para fecha, hora, ubicación)
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    flex: 1,
    marginLeft: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  
  // Categorías/Chips
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Layout
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  
  // DateTime específico
  dateTimeGroupContainer: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  timeFieldWrapper: {
    flex: 1,
    minWidth: 140,
  },
  
  // Dropdown (para speakers)
  dropdownInput: {
    borderRadius: 8,
    justifyContent: 'center',
    height: 44,
    marginBottom: 0,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  dropdownListContainer: {
    maxHeight: 160,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  dropdownItem: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  
  // Tags (invitados)
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  // Botones de acción
  submitError: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#FF453A',
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Contenedores legacy (para compatibilidad)
  textFieldContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    height: 44,
    justifyContent: 'center',
  },
  textAreaContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
});