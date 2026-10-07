import "server-only";
import { normalizeSchemas, serializeSchema } from "@/lib/seo/schemas";
export default function Schemas({ schemas = [] }){
	const normalizedSchemas = normalizeSchemas(schemas);
	return(
		<>
			{
				normalizedSchemas.map((schema, index) => (
					<script
						key={`jsonld-${schema?.["@id"] || index}`}
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: serializeSchema(schema),
						}}
					/>
				))
			}
		</>
	)
}