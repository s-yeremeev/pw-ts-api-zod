import { z } from 'zod'

/**
 * GET /api/v2/companies/{id}
 * Retrieve a company by its ID.
 *
 * Path parameter:
 *   - id (required): company identifier.
 *
 * Response 200: CompanyResponse
 *   - data.id                                          – company ID
 *   - data.internalCompanyNumber                       – internal company number
 *   - data.name                                        – company name
 *   - data.address.city                                – city
 *   - data.address.postalCode                          – postal code
 *   - data.address.stateCode                           – state code
 *   - data.address.countryCode                         – country code (ISO 3166-1 alpha-2)
 *   - data.paymentDetails.paymentMethod                – payment method identifier
 *   - data.furtherDetails.customerType                 – customer type
 *   - data.furtherDetails.agency.id                    – agency ID
 *   - data.furtherDetails.agency.name                  – agency name
 *   - data.services.employeePortal                     – employee portal feature flags
 *   - data.totalNumberOfEmployees                      – total number of employees
 *   - accessRights                                     – fine-grained permission flags for the current user
 */

const AddressSchema = z.object({
  city: z.string().optional(),
  postalCode: z.string().optional(),
  stateCode: z.string().optional(),
  countryCode: z.string().optional(),
})

const PaymentDetailsSchema = z.object({
  paymentMethod: z.string().optional(),
})

const AgencySchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
})

const CompanyFurtherDetailsSchema = z.object({
  customerType: z.string().optional(),
  agency: AgencySchema.optional(),
})

const EmployeePortalSchema = z.object({
  enabled: z.boolean().optional(),
  individualPortalEnabled: z.boolean().optional(),
  companyPortalEnabled: z.boolean().optional(),
  changeOrderEnabled: z.boolean().optional(),
  changeOrderConfirmationRequired: z.boolean().optional(),
})

const CompanyDataSchema = z.strictObject({
  id: z.number(),
  internalCompanyNumber: z.number().optional(),
  name: z.string().optional(),
  address: AddressSchema.optional(),
  paymentDetails: PaymentDetailsSchema.optional(),
  furtherDetails: CompanyFurtherDetailsSchema.optional(),
  services: z.object({ employeePortal: EmployeePortalSchema.optional() }).optional(),
  totalNumberOfEmployees: z.number().optional(),
})

const CanViewEditSchema = z.object({
  canView: z.boolean().optional(),
  canEdit: z.boolean().optional(),
})

const CanViewEditCreateSchema = z.object({
  canView: z.boolean().optional(),
  canEdit: z.boolean().optional(),
  canCreate: z.boolean().optional(),
})

const EmployeePortalRightsSchema = z.object({
  canView: z.boolean().optional(),
  canEdit: z.boolean().optional(),
  changeOrderConfirmationRequired: CanViewEditSchema.optional(),
  individualPortalEnabled: CanViewEditSchema.optional(),
  companyPortalEnabled: CanViewEditSchema.optional(),
})

const CompanyAccessRightsSchema = z.object({
  canEdit: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canMerge: z.boolean().optional(),
  canViewInternalCompanyNumber: z.boolean().optional(),
  association: CanViewEditSchema.optional(),
  furtherDetails: CanViewEditSchema.optional(),
  services: z.object({ employeePortal: EmployeePortalRightsSchema.optional() }).optional(),
  contracts: z
    .object({
      canView: z.boolean().optional(),
      documents: CanViewEditCreateSchema.optional(),
      notes: CanViewEditSchema.optional(),
    })
    .optional(),
  users: CanViewEditCreateSchema.optional(),
  documents: CanViewEditCreateSchema.optional(),
  notes: CanViewEditCreateSchema.optional(),
})

export const CompanyResponseSchema = z.object({
  data: CompanyDataSchema,
  accessRights: CompanyAccessRightsSchema.optional(),
})

export type CompanyResponse = z.infer<typeof CompanyResponseSchema>
