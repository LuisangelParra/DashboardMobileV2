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
  timeFieldsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Date/Time Picker buttons (móvil)
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  datePickerText: {
    fontSize: 16,
    flex: 1,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  timePickerText: {
    fontSize: 16,
    flex: 1,
  },
  
  // Web-specific styles
  webDatePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  webDateInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    height: 44,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        border: 'none',
      },
    }),
  },
  webTimePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  webTimeInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    height: 44,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        border: 'none',
      },
    }),
  },
  dateDisplayText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  timeDisplayText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  mainInfoCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  metadataContainer: {
    gap: 12,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    fontSize: 16,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  capacitySection: {
    margin: 16,
  },
  capacityDetails: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  capacityDetailItem: {
    alignItems: 'center',
    gap: 8,
  },
  capacityDetailText: {
    alignItems: 'center',
  },
  capacityDetailValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  capacityDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  viewAllButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerSection: {
    margin: 16,
    marginBottom: 32,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
});

