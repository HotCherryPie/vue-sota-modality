[x] Modals with `isDismissed` should be treated as closed.
[ ] Modal resolution (returned by `modal.open()` should became `ModalOpenRequest` which looks like `{ resolution: Promise<Resolution>, wasOpened: boolean /*false if modal was not open for some reson*/ }`)
[ ] Add `isPresent` functionality. Child `isPresent` is like `isOpen` but `isDismissed` is not considered.
[ ] Add **Pool** functionality. `useModalsPool`.
[ ] Return focus to previously focused element after close. Should be implemented in `use-modal-extras.ts`.
[ ] Add drag2close ability.
[ ] Modal implementations should control inertness of the content.
[ ] Consider usage of `AbortSignal` for dismiss invocation.
[ ] Add test case for `requestDismiss` with `window.confirm()`
