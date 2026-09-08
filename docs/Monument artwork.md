# Monument artwork

The demo uses a shared collection of twelve AI-generated architectural watercolours. These are decorative illustrations, not photographs or authoritative architectural records. The public landing and manifesto are unchanged.

## Delivery

Assets live in `public/artwork/<monument-name>.webp`. Generated with the built-in image generation tool, then resized to 960px wide and encoded as WebP (quality 78) using the existing Sharp dependency. Next.js serves responsive variants. No runtime image generation or external image host is used.

Page headers, family and shared views, workflow headers, case briefs, the profile picker and service-card backgrounds use the same component. Workflow art is quieter and does not add a large hero above each step. Printed case briefs omit decorative art.

The image is not mounted until the saved preference has hydrated and data saver is off. The SVG remains while loading or if a request fails. Card imagery is lazy-loaded. Turning data saver on prevents future artwork requests; it cannot recover bytes already downloaded.

## Reset and reload

Reset progress, the fresh-run guide and Load latest demo share one in-app confirmation dialog. Cancel is focused first; Escape and backdrop clicks cancel; keyboard focus stays inside while open. Warnings are translated in English, Hindi and Kannada.

“Load latest demo” records explicit consent in a short-lived, tab-scoped marker before a full navigation to `/home`. The newly loaded document waits for auth, graph and workflow hydration, applies its own seed, exits delegated mode, clears drafts and then removes the marker. Language, the original profile and data saver remain selected. Cancel/keep-progress do not reload or reset. An expired or malformed marker does not reset anything. This is not an automatic deployment detector, and code-only updates do not require erasing progress.

## Generation prompts

### Taj Mahal

Use case: stylized-concept. Create a refined architectural illustration of the Taj Mahal, Agra, for the background of an Indian civic app page header. Landscape 3:2 composition. Recognizable accurate symmetrical white marble mausoleum, central onion dome, four slender minarets, intricate arches and subtle carved detail. Entire monument visible, no cropping of minarets. Monument occupies central 80 percent width and lower 75 percent height. Editorial architectural watercolor with realistic material detail, restrained warm ivory stone and cool muted grey shadows, soft daylight. Plain warm off-white paper background #f8f6f0, no sky scene, no gardens, no people; edges and ground dissolve gently into paper. Detailed but quiet, dignified, not a tourist poster. No lettering, no watermark, no flags, no logos or official emblems. This is a standalone artwork asset, no UI or frame.

### Vidhana Soudha

Use case: stylized-concept. Create a refined architectural illustration of Vidhana Soudha in Bengaluru, India, for a civic app page header. Landscape 3:2. Recognizable real Neo-Dravidian legislature building: broad symmetrical granite facade, monumental central staircase and columned entrance, central dome and smaller corner domes, long horizontal wings. Entire building visible. Front elevation with slight natural depth. Building occupies central 90 percent width and lower 65 percent height. Editorial architectural watercolor with realistic carved stone detail, restrained warm ivory granite, cool muted grey shadows, soft daylight. Plain warm off-white paper background #f8f6f0; edges and ground dissolve gently into paper. Match a museum-quality watercolor Taj Mahal illustration. No sky scene, no people, no gardens, no text, no lettering, no watermark, no flags, no official emblems or insignia (omit the roof emblem). Detailed yet quiet, not a tourist poster. Standalone artwork asset, no UI, no frame.

### qutub-minar

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Qutub Minar, Delhi: the tall tapering red sandstone minaret with five distinct storeys, projecting balconies, fluted masonry and detailed stone carving. Show the entire tower and a restrained hint of its ruined stone base. Compose the tall tower in the right half with generous blank space to its left. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic stone detail, restrained warm ivory and muted natural stone colours, cool grey shadows, soft daylight. Complete architecture visible, centered in the lower 75 percent of the image, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### gateway-of-india

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Gateway of India, Mumbai: the recognizable basalt triumphal waterfront arch with its large central pointed opening, four corner turrets and Indo-Saracenic carved details. Show the whole monument front-on with natural shallow depth, no waterfront scene. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic stone detail, restrained warm ivory and muted natural stone colours, cool grey shadows, soft daylight. Complete architecture visible, centered in the lower 75 percent of the image, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### india-gate

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: India Gate, New Delhi: the recognizable tall buff sandstone war memorial arch, broad squared upper cornice and central round-topped passage. Show the complete monument with a slight three-quarter view, preserve its simple real proportions; do not confuse with Gateway of India. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic stone detail, restrained warm ivory and muted natural stone colours, cool grey shadows, soft daylight. Complete architecture visible, centered in the lower 75 percent of the image, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### charminar

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Charminar, Hyderabad: the real square monument with four tall corner minarets, each with stacked balconies and a small domed crown, and four grand pointed arches. Show the complete building in a shallow three-quarter view. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic stone detail, restrained warm ivory and muted natural stone colours, cool grey shadows, soft daylight. Complete architecture visible, centered with margins, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### hawa-mahal

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Hawa Mahal, Jaipur: the recognizable five-storey pink sandstone honeycomb palace facade, many tiny jharokha windows, stepped pyramidal silhouette. Complete front elevation. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic stone detail, restrained warm ivory and muted natural stone colours, cool grey shadows, soft daylight. Complete architecture visible, centered with margins, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### sanchi-stupa

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Great Stupa at Sanchi: the broad hemispherical stone dome, square harmika and tiered parasol at its apex, stone balustrade and an intricately carved torana gateway in the foreground. Complete structure in a shallow three-quarter view. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic stone detail, restrained warm ivory and muted natural stone colours, cool grey shadows, soft daylight. Complete architecture visible, centered with margins, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### konark-wheel

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Konark Sun Temple stone wheel, Odisha: one monumental intricately carved sandstone chariot wheel with eight primary spokes, central hub and detailed rim, set against just a fragment of the temple plinth. Show complete wheel with realistic carved detail. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic stone detail, restrained warm ivory and muted natural stone colours, cool grey shadows, soft daylight. Complete architecture visible, centered with margins, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### howrah-bridge

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Howrah Bridge (Rabindra Setu), Kolkata: the recognizable massive grey steel cantilever truss bridge, not a suspension bridge. Full horizontal span and lattice towers in a gentle three-quarter perspective across a very faint strip of river. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic material detail, restrained warm ivory and muted natural colours, cool grey shadows, soft daylight. Complete architecture visible, centered with generous margins, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### mysore-palace

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: Mysore Palace, Karnataka: the recognizable broad Indo-Saracenic palace front, cream-grey stone facade, central tall tower with deep muted rose dome, smaller domed towers, long arcade. Complete front elevation with shallow natural depth. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic material detail, restrained warm ivory and muted natural colours, cool grey shadows, soft daylight. Complete architecture visible, centered with generous margins, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.

### meenakshi-gopuram

Use case: stylized-concept. Standalone decorative architectural artwork for Citizen, an independent Indian civic app. Subject: A Meenakshi Amman Temple gopuram, Madurai: the recognizable tall tapered pyramidal South Indian gateway tower with tier upon tier of finely sculpted figures, rectangular stone entry base and gently curved crest. Authentic muted mineral pigments, pale faded teal, rose and ivory, not bright rainbow colors. Show the whole tower. Landscape 3:2 composition. Match a refined architectural watercolor collection: realistic material detail, restrained warm ivory and muted natural colours, cool grey shadows, soft daylight. Complete architecture visible, centered with generous margins, ground dissolves into warm off-white paper #fffdf5. Quiet museum illustration, not a tourism poster. No people, cars, text, lettering, watermark, logos, flags or official insignia. No surrounding sky scene or dramatic landscape. Delicate paper texture and gently dissolving edges.
