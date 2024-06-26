# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `CableReady::BroadcastJob`.
# Please instead update this file by running `bin/tapioca dsl CableReady::BroadcastJob`.


class CableReady::BroadcastJob
  class << self
    sig do
      params(
        identifier: T.untyped,
        operations: T.untyped,
        model: T.untyped,
        block: T.nilable(T.proc.params(job: CableReady::BroadcastJob).void)
      ).returns(T.any(CableReady::BroadcastJob, FalseClass))
    end
    def perform_later(identifier:, operations:, model: T.unsafe(nil), &block); end

    sig { params(identifier: T.untyped, operations: T.untyped, model: T.untyped).returns(T.untyped) }
    def perform_now(identifier:, operations:, model: T.unsafe(nil)); end
  end
end
