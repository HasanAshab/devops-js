import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  title: 'Adonis Rest Api Boilerplate',
  version: '1.0.0',
  tagIndex: 3,
  snakeCase: false,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT',
  persistAuthorization: true,
  showFullPath: false,
  common: {
    parameters: {
      sortable: [
        {
          in: "query",
          name: "sortBy",
          schema: { type: "string", example: "foo" },
        },
        {
          in: "query",
          name: "sortType",
          schema: { type: "string", example: "ASC" },
        }
      ],
      paginatable: [
        {
          in: "query",
          name: "page",
          schema: { type: "integer", example: 1 },
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", example: 10 },
        }
      ],
      identifiableDevice: [
        {
          in: 'header',
          required: true,
          name: "X-Device-Id",
          description: "ID of client's device",
          schema: { type: "string" }
        }
      ]

    },
  }
}
