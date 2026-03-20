<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Security Policy — Salary & Tax Calculator ID</title>
	<meta
		name="description"
		content="Security policy and vulnerability reporting guidelines for the Salary & Tax Calculator ID."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl">
		<a
			href={resolve('/')}
			class="mb-8 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
		>
			<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to Calculator
		</a>

		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="border-b border-gray-200 bg-gray-50 px-6 py-5">
				<div class="flex items-center space-x-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<h1 class="text-2xl font-bold text-gray-900">Security Policy</h1>
				</div>
			</div>

			<div class="prose prose-blue max-w-none px-6 py-6">
				<h2>Supported Versions</h2>
				<p>
					The following versions of this project are currently being supported with security
					updates:
				</p>

				<table>
					<thead>
						<tr>
							<th>Version</th>
							<th>Supported</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>0.0.x</td>
							<td>✅</td>
						</tr>
					</tbody>
				</table>

				<h2>Reporting a Vulnerability</h2>
				<p>
					If you discover a security vulnerability within this project, please report it
					immediately.
				</p>

				<p>You can report vulnerabilities by:</p>
				<ol>
					<li>
						Opening a <a
							href="https://github.com/nizmitz/indo-salary-calculator/issues"
							class="text-blue-600 hover:text-blue-500">GitHub Issue</a
						> (if it is not a sensitive/exploitable bug).
					</li>
					<li>
						Contacting the maintainer directly via GitHub or the contact information provided at
						<a href="https://nizmitz.com" class="text-blue-600 hover:text-blue-500">nizmitz.com</a>.
					</li>
				</ol>

				<p>
					Please do not disclose security vulnerabilities publicly until they have been addressed.
					We appreciate your help in keeping this project secure.
				</p>
			</div>
		</div>

		<p class="mt-6 text-center text-xs text-gray-400">
			This policy is also available at <code>.well-known/security.txt</code>
		</p>
	</div>
</div>
