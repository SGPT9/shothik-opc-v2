
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "audit_journal_entries": {
                  Row: {
                    "audit_hash": string,"created_at": string,"entry_id": string,"id": number,"initiator_id": string | null,"initiator_kind": string | null,"is_balanced": boolean,"lines": NonNullable<Json>,"memo": string,"posted_at": string,"total_credit_bdt": number,"total_debit_bdt": number,"transaction_ref": string,"transaction_type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audit_hash": string,"created_at"?: string,"entry_id": string,"id"?: number,"initiator_id"?: string | null,"initiator_kind"?: string | null,"is_balanced"?: boolean,"lines"?: NonNullable<Json>,"memo": string,"posted_at"?: string,"total_credit_bdt": number,"total_debit_bdt": number,"transaction_ref": string,"transaction_type": string
                  }
                  Update: {
                    "audit_hash"?: string,"created_at"?: string,"entry_id"?: string,"id"?: number,"initiator_id"?: string | null,"initiator_kind"?: string | null,"is_balanced"?: boolean,"lines"?: NonNullable<Json>,"memo"?: string,"posted_at"?: string,"total_credit_bdt"?: number,"total_debit_bdt"?: number,"transaction_ref"?: string,"transaction_type"?: string
                  }
                  Relationships: [
                    
                  ]
                },"author_earnings": {
                  Row: {
                    "available_balance": number,"lifetime_revenue": number,"monthly_breakdown": NonNullable<Json>,"pending_payouts": number,"per_book_earnings": NonNullable<Json>,"published_books_count": number,"total_earnings": number,"total_paid_out": number,"total_units_sold": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "available_balance"?: number,"lifetime_revenue"?: number,"monthly_breakdown"?: NonNullable<Json>,"pending_payouts"?: number,"per_book_earnings"?: NonNullable<Json>,"published_books_count"?: number,"total_earnings"?: number,"total_paid_out"?: number,"total_units_sold"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "available_balance"?: number,"lifetime_revenue"?: number,"monthly_breakdown"?: NonNullable<Json>,"pending_payouts"?: number,"per_book_earnings"?: NonNullable<Json>,"published_books_count"?: number,"total_earnings"?: number,"total_paid_out"?: number,"total_units_sold"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"author_payout_accounts": {
                  Row: {
                    "account_name": string,"account_number": string,"bank_name": string | null,"created_at": string,"id": string,"is_default": boolean,"method": string,"routing_number": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "account_name": string,"account_number": string,"bank_name"?: string | null,"created_at"?: string,"id"?: string,"is_default"?: boolean,"method"?: string,"routing_number"?: string | null,"user_id": string
                  }
                  Update: {
                    "account_name"?: string,"account_number"?: string,"bank_name"?: string | null,"created_at"?: string,"id"?: string,"is_default"?: boolean,"method"?: string,"routing_number"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"author_payouts": {
                  Row: {
                    "amount": number,"created_at": string,"id": string,"method": string,"period_end": string | null,"period_start": string | null,"status": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"id"?: string,"method"?: string,"period_end"?: string | null,"period_start"?: string | null,"status"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"id"?: string,"method"?: string,"period_end"?: string | null,"period_start"?: string | null,"status"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"authorship_certificates": {
                  Row: {
                    "author_id": string,"certificate_id": string,"content_hash_sha256": string,"issued_at": string,"merkle_root": string,"project_id": string,"status": string,"tamper_proof_signature": string,"title": string,"word_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"certificate_id": string,"content_hash_sha256": string,"issued_at"?: string,"merkle_root": string,"project_id": string,"status"?: string,"tamper_proof_signature": string,"title": string,"word_count"?: number
                  }
                  Update: {
                    "author_id"?: string,"certificate_id"?: string,"content_hash_sha256"?: string,"issued_at"?: string,"merkle_root"?: string,"project_id"?: string,"status"?: string,"tamper_proof_signature"?: string,"title"?: string,"word_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "authorship_certificates_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    }
                  ]
                },"background_jobs": {
                  Row: {
                    "attempts": number,"completed_at": string | null,"created_at": string,"id": number,"idempotency_key": string | null,"last_error": string | null,"locked_at": string | null,"locked_by": string | null,"max_attempts": number,"payload": NonNullable<Json>,"status": string,"task_type": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"completed_at"?: string | null,"created_at"?: string,"id"?: number,"idempotency_key"?: string | null,"last_error"?: string | null,"locked_at"?: string | null,"locked_by"?: string | null,"max_attempts"?: number,"payload"?: NonNullable<Json>,"status"?: string,"task_type": string,"updated_at"?: string
                  }
                  Update: {
                    "attempts"?: number,"completed_at"?: string | null,"created_at"?: string,"id"?: number,"idempotency_key"?: string | null,"last_error"?: string | null,"locked_at"?: string | null,"locked_by"?: string | null,"max_attempts"?: number,"payload"?: NonNullable<Json>,"status"?: string,"task_type"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"book_chapter_attempts": {
                  Row: {
                    "attempt_number": number,"book_id": string,"chapter_index": number,"content": string,"id": string,"passed_validation": boolean,"recorded_at": string,"validation_report": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_number"?: number,"book_id": string,"chapter_index": number,"content"?: string,"id"?: string,"passed_validation"?: boolean,"recorded_at"?: string,"validation_report"?: Json | null
                  }
                  Update: {
                    "attempt_number"?: number,"book_id"?: string,"chapter_index"?: number,"content"?: string,"id"?: string,"passed_validation"?: boolean,"recorded_at"?: string,"validation_report"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "book_chapter_attempts_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "publishing_books"
      referencedColumns: ["id"]
    }
                  ]
                },"book_chapters": {
                  Row: {
                    "accepted_at": string,"book_id": string,"chapter_index": number,"content": string,"id": string,"status": string | null,"title": string,"word_count": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string,"book_id": string,"chapter_index": number,"content"?: string,"id"?: string,"status"?: string | null,"title": string,"word_count"?: number | null
                  }
                  Update: {
                    "accepted_at"?: string,"book_id"?: string,"chapter_index"?: number,"content"?: string,"id"?: string,"status"?: string | null,"title"?: string,"word_count"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "book_chapters_book_id_fkey"
      columns: ["book_id"]
isOneToOne: false
      referencedRelation: "publishing_books"
      referencedColumns: ["id"]
    }
                  ]
                },"book_suite_manifests": {
                  Row: {
                    "created_at": string,"id": string,"module_type": string,"project_id": string,"state": NonNullable<Json>,"updated_at": string,"user_id": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"module_type": string,"project_id": string,"state"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string,"version"?: number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"module_type"?: string,"project_id"?: string,"state"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string,"version"?: number
                  }
                  Relationships: [
                    
                  ]
                },"canvas_artifacts": {
                  Row: {
                    "content": NonNullable<Json>,"created_at": string,"created_by": string,"id": string,"is_public": boolean,"organization_id": string | null,"title": string,"type": string,"updated_at": string,"version": number,"workspace_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: NonNullable<Json>,"created_at"?: string,"created_by": string,"id"?: string,"is_public"?: boolean,"organization_id"?: string | null,"title": string,"type"?: string,"updated_at"?: string,"version"?: number,"workspace_id"?: string | null
                  }
                  Update: {
                    "content"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string,"id"?: string,"is_public"?: boolean,"organization_id"?: string | null,"title"?: string,"type"?: string,"updated_at"?: string,"version"?: number,"workspace_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "canvas_artifacts_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "canvas_artifacts_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"channels": {
                  Row: {
                    "category": string | null,"cover_image_url": string | null,"created_at": string | null,"description": string | null,"id": string,"name": string,"participant_type": string | null,"status": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: string | null,"cover_image_url"?: string | null,"created_at"?: string | null,"description"?: string | null,"id"?: string,"name": string,"participant_type"?: string | null,"status"?: string | null
                  }
                  Update: {
                    "category"?: string | null,"cover_image_url"?: string | null,"created_at"?: string | null,"description"?: string | null,"id"?: string,"name"?: string,"participant_type"?: string | null,"status"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"chat_conversations": {
                  Row: {
                    "archived": boolean,"context_ref": NonNullable<Json>,"created_at": string,"id": string,"last_message_preview": string | null,"message_count": number,"model_handle": string | null,"pinned": boolean,"status": string,"surface": string,"temporary": boolean,"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "archived"?: boolean,"context_ref"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"last_message_preview"?: string | null,"message_count"?: number,"model_handle"?: string | null,"pinned"?: boolean,"status"?: string,"surface"?: string,"temporary"?: boolean,"title"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "archived"?: boolean,"context_ref"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"last_message_preview"?: string | null,"message_count"?: number,"model_handle"?: string | null,"pinned"?: boolean,"status"?: string,"surface"?: string,"temporary"?: boolean,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"chat_messages": {
                  Row: {
                    "author_id": string,"channel_id": string | null,"content": string,"conversation_id": string | null,"created_at": string | null,"id": string,"metadata": Json | null,"model": string | null,"role": string | null,"thread_id": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"channel_id"?: string | null,"content": string,"conversation_id"?: string | null,"created_at"?: string | null,"id"?: string,"metadata"?: Json | null,"model"?: string | null,"role"?: string | null,"thread_id"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "author_id"?: string,"channel_id"?: string | null,"content"?: string,"conversation_id"?: string | null,"created_at"?: string | null,"id"?: string,"metadata"?: Json | null,"model"?: string | null,"role"?: string | null,"thread_id"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"comments": {
                  Row: {
                    "author_id": string,"content": string,"created_at": string | null,"downvotes": number | null,"id": string,"parent_id": string | null,"post_id": string | null,"upvotes": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"content": string,"created_at"?: string | null,"downvotes"?: number | null,"id"?: string,"parent_id"?: string | null,"post_id"?: string | null,"upvotes"?: number | null
                  }
                  Update: {
                    "author_id"?: string,"content"?: string,"created_at"?: string | null,"downvotes"?: number | null,"id"?: string,"parent_id"?: string | null,"post_id"?: string | null,"upvotes"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "comments_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "comments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "comments_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    }
                  ]
                },"commodity_inland_lcs": {
                  Row: {
                    "buyer_name": string,"commodity_name": string,"created_at": string,"escrow_status": string,"id": number,"lc_contract_seal_sha256": string,"lc_number": string,"quantity_tons": number,"seller_name": string,"total_value_bdt": number,"unit_price_per_ton_bdt": number
                  }
                  ComputedFields: never
                  Insert: {
                    "buyer_name": string,"commodity_name": string,"created_at"?: string,"escrow_status"?: string,"id"?: number,"lc_contract_seal_sha256": string,"lc_number": string,"quantity_tons": number,"seller_name": string,"total_value_bdt": number,"unit_price_per_ton_bdt": number
                  }
                  Update: {
                    "buyer_name"?: string,"commodity_name"?: string,"created_at"?: string,"escrow_status"?: string,"id"?: number,"lc_contract_seal_sha256"?: string,"lc_number"?: string,"quantity_tons"?: number,"seller_name"?: string,"total_value_bdt"?: number,"unit_price_per_ton_bdt"?: number
                  }
                  Relationships: [
                    
                  ]
                },"companies": {
                  Row: {
                    "business_model": string,"business_type": string | null,"created_at": string,"docs": NonNullable<Json>,"domain": string,"email": string,"feed": NonNullable<Json>,"id": number,"industry": string,"is_paused": boolean,"name": string,"problem_statement": string | null,"revenue_bdt": number,"slug": string,"tasks": NonNullable<Json>,"updated_at": string,"user_id": string,"visitor_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "business_model"?: string,"business_type"?: string | null,"created_at"?: string,"docs"?: NonNullable<Json>,"domain": string,"email": string,"feed"?: NonNullable<Json>,"id"?: number,"industry"?: string,"is_paused"?: boolean,"name": string,"problem_statement"?: string | null,"revenue_bdt"?: number,"slug": string,"tasks"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string,"visitor_count"?: number
                  }
                  Update: {
                    "business_model"?: string,"business_type"?: string | null,"created_at"?: string,"docs"?: NonNullable<Json>,"domain"?: string,"email"?: string,"feed"?: NonNullable<Json>,"id"?: number,"industry"?: string,"is_paused"?: boolean,"name"?: string,"problem_statement"?: string | null,"revenue_bdt"?: number,"slug"?: string,"tasks"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string,"visitor_count"?: number
                  }
                  Relationships: [
                    
                  ]
                },"courier_consignments": {
                  Row: {
                    "cod_amount_bdt": number,"consignment_id": string,"courier_provider": string,"created_at": string,"customer_name": string,"customer_phone": string,"delivery_address": string,"delivery_charge_bdt": number,"id": number,"order_id": string,"status": string,"tracking_code": string,"verification_hash_sha256": string,"zone": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cod_amount_bdt": number,"consignment_id": string,"courier_provider": string,"created_at"?: string,"customer_name": string,"customer_phone": string,"delivery_address": string,"delivery_charge_bdt": number,"id"?: number,"order_id": string,"status"?: string,"tracking_code": string,"verification_hash_sha256": string,"zone": string
                  }
                  Update: {
                    "cod_amount_bdt"?: number,"consignment_id"?: string,"courier_provider"?: string,"created_at"?: string,"customer_name"?: string,"customer_phone"?: string,"delivery_address"?: string,"delivery_charge_bdt"?: number,"id"?: number,"order_id"?: string,"status"?: string,"tracking_code"?: string,"verification_hash_sha256"?: string,"zone"?: string
                  }
                  Relationships: [
                    
                  ]
                },"creator_guilds": {
                  Row: {
                    "collective_pool_value_bdt": number,"created_at": string,"escrow_badge": string,"guild_id": string,"guild_name": string,"id": number,"member_count": number,"regional_hub": string,"vertical": string
                  }
                  ComputedFields: never
                  Insert: {
                    "collective_pool_value_bdt"?: number,"created_at"?: string,"escrow_badge"?: string,"guild_id": string,"guild_name": string,"id"?: number,"member_count"?: number,"regional_hub": string,"vertical": string
                  }
                  Update: {
                    "collective_pool_value_bdt"?: number,"created_at"?: string,"escrow_badge"?: string,"guild_id"?: string,"guild_name"?: string,"id"?: number,"member_count"?: number,"regional_hub"?: string,"vertical"?: string
                  }
                  Relationships: [
                    
                  ]
                },"document_embeddings": {
                  Row: {
                    "content": string,"created_at": string,"embedding": string | null,"file_path": string | null,"id": string,"metadata": NonNullable<Json>,"project_id": string | null,"repo": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"created_at"?: string,"embedding"?: string | null,"file_path"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>,"project_id"?: string | null,"repo"?: string | null,"user_id": string
                  }
                  Update: {
                    "content"?: string,"created_at"?: string,"embedding"?: string | null,"file_path"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>,"project_id"?: string | null,"repo"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"dsh_sessions": {
                  Row: {
                    "created_at": string,"events": NonNullable<Json>,"forked_at_event_index": number | null,"forked_from_session_id": string | null,"id": string,"metrics": NonNullable<Json>,"status": string,"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"events"?: NonNullable<Json>,"forked_at_event_index"?: number | null,"forked_from_session_id"?: string | null,"id": string,"metrics"?: NonNullable<Json>,"status"?: string,"title": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"events"?: NonNullable<Json>,"forked_at_event_index"?: number | null,"forked_from_session_id"?: string | null,"id"?: string,"metrics"?: NonNullable<Json>,"status"?: string,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"engine_kv_snapshots": {
                  Row: {
                    "entity_id": string,"namespace": string,"payload": NonNullable<Json>,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "entity_id": string,"namespace": string,"payload"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "entity_id"?: string,"namespace"?: string,"payload"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"factoring_offers": {
                  Row: {
                    "advance_rate_percent": number,"annualized_apr": number,"buyer_id": string,"buyer_name": string,"created_at": string,"disbursement_channel": string,"discount_fee_bdt": number,"gross_advance_bdt": number,"id": number,"invoice_face_value_bdt": number,"invoice_id": string,"net_payout_bdt": number,"offer_id": string,"status": string,"verification_seal_sha256": string
                  }
                  ComputedFields: never
                  Insert: {
                    "advance_rate_percent": number,"annualized_apr": number,"buyer_id": string,"buyer_name": string,"created_at"?: string,"disbursement_channel": string,"discount_fee_bdt": number,"gross_advance_bdt": number,"id"?: number,"invoice_face_value_bdt": number,"invoice_id": string,"net_payout_bdt": number,"offer_id": string,"status"?: string,"verification_seal_sha256": string
                  }
                  Update: {
                    "advance_rate_percent"?: number,"annualized_apr"?: number,"buyer_id"?: string,"buyer_name"?: string,"created_at"?: string,"disbursement_channel"?: string,"discount_fee_bdt"?: number,"gross_advance_bdt"?: number,"id"?: number,"invoice_face_value_bdt"?: number,"invoice_id"?: string,"net_payout_bdt"?: number,"offer_id"?: string,"status"?: string,"verification_seal_sha256"?: string
                  }
                  Relationships: [
                    
                  ]
                },"idempotency_keys": {
                  Row: {
                    "created_at": string,"endpoint": string,"expires_at": string,"key": string,"request_hash": string,"response_body": Json | null,"response_status": number | null,"state": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"endpoint": string,"expires_at": string,"key": string,"request_hash": string,"response_body"?: Json | null,"response_status"?: number | null,"state"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"endpoint"?: string,"expires_at"?: string,"key"?: string,"request_hash"?: string,"response_body"?: Json | null,"response_status"?: number | null,"state"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"inventory_items": {
                  Row: {
                    "category": string,"daraz_stock": number,"dark_hub_reserve": number,"id": number,"lead_time_days": number,"name": string,"shopify_stock": number,"sku": string,"supplier_name": string,"total_stock": number,"unit_cost_bdt": number,"unit_price_bdt": number,"updated_at": string,"whatsapp_stock": number,"woocommerce_stock": number
                  }
                  ComputedFields: never
                  Insert: {
                    "category": string,"daraz_stock"?: number,"dark_hub_reserve"?: number,"id"?: number,"lead_time_days"?: number,"name": string,"shopify_stock"?: number,"sku": string,"supplier_name": string,"total_stock"?: number,"unit_cost_bdt": number,"unit_price_bdt": number,"updated_at"?: string,"whatsapp_stock"?: number,"woocommerce_stock"?: number
                  }
                  Update: {
                    "category"?: string,"daraz_stock"?: number,"dark_hub_reserve"?: number,"id"?: number,"lead_time_days"?: number,"name"?: string,"shopify_stock"?: number,"sku"?: string,"supplier_name"?: string,"total_stock"?: number,"unit_cost_bdt"?: number,"unit_price_bdt"?: number,"updated_at"?: string,"whatsapp_stock"?: number,"woocommerce_stock"?: number
                  }
                  Relationships: [
                    
                  ]
                },"ivr_call_records": {
                  Row: {
                    "call_id": string,"call_status": string,"cod_amount_bdt": number,"created_at": string,"customer_name": string,"customer_phone": string,"dtmf_response": string | null,"id": number,"order_id": string,"recording_duration_sec": number | null,"risk_tier": string,"rto_risk_score": number
                  }
                  ComputedFields: never
                  Insert: {
                    "call_id": string,"call_status"?: string,"cod_amount_bdt": number,"created_at"?: string,"customer_name": string,"customer_phone": string,"dtmf_response"?: string | null,"id"?: number,"order_id": string,"recording_duration_sec"?: number | null,"risk_tier"?: string,"rto_risk_score"?: number
                  }
                  Update: {
                    "call_id"?: string,"call_status"?: string,"cod_amount_bdt"?: number,"created_at"?: string,"customer_name"?: string,"customer_phone"?: string,"dtmf_response"?: string | null,"id"?: number,"order_id"?: string,"recording_duration_sec"?: number | null,"risk_tier"?: string,"rto_risk_score"?: number
                  }
                  Relationships: [
                    
                  ]
                },"llm_usage": {
                  Row: {
                    "cost_usd": number,"created_at": string,"id": number,"input_tokens": number,"output_tokens": number,"provider": string,"tokens": number,"tool": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cost_usd"?: number,"created_at"?: string,"id"?: number,"input_tokens"?: number,"output_tokens"?: number,"provider": string,"tokens"?: number,"tool": string,"user_id": string
                  }
                  Update: {
                    "cost_usd"?: number,"created_at"?: string,"id"?: number,"input_tokens"?: number,"output_tokens"?: number,"provider"?: string,"tokens"?: number,"tool"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"marketplace_agents": {
                  Row: {
                    "author_id": string,"author_name": string,"category": string,"created_at": string,"description": string,"icon_name": string,"id": string,"installs_count": number,"is_published": boolean,"manifest": NonNullable<Json>,"name": string,"price_bdt": number,"price_credits": number,"rating": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string,"author_name": string,"category": string,"created_at"?: string,"description": string,"icon_name"?: string,"id": string,"installs_count"?: number,"is_published"?: boolean,"manifest"?: NonNullable<Json>,"name": string,"price_bdt"?: number,"price_credits"?: number,"rating"?: number,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string,"author_name"?: string,"category"?: string,"created_at"?: string,"description"?: string,"icon_name"?: string,"id"?: string,"installs_count"?: number,"is_published"?: boolean,"manifest"?: NonNullable<Json>,"name"?: string,"price_bdt"?: number,"price_credits"?: number,"rating"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"mfs_transactions": {
                  Row: {
                    "amount_bdt": number,"created_at": string,"id": number,"metadata": NonNullable<Json>,"provider": string,"reconciled_at": string,"status": string,"tier": string | null,"trx_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_bdt": number,"created_at"?: string,"id"?: number,"metadata"?: NonNullable<Json>,"provider": string,"reconciled_at"?: string,"status"?: string,"tier"?: string | null,"trx_id": string,"user_id"?: string
                  }
                  Update: {
                    "amount_bdt"?: number,"created_at"?: string,"id"?: number,"metadata"?: NonNullable<Json>,"provider"?: string,"reconciled_at"?: string,"status"?: string,"tier"?: string | null,"trx_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"mushak_63_challans": {
                  Row: {
                    "buyer_bin": string | null,"buyer_name": string,"challan_number": string,"id": number,"issued_at": string,"seller_bin": string,"total_payable_bdt": number,"total_taxable_amount_bdt": number,"total_vat_bdt": number,"verification_seal_sha256": string
                  }
                  ComputedFields: never
                  Insert: {
                    "buyer_bin"?: string | null,"buyer_name": string,"challan_number": string,"id"?: number,"issued_at"?: string,"seller_bin": string,"total_payable_bdt": number,"total_taxable_amount_bdt": number,"total_vat_bdt": number,"verification_seal_sha256": string
                  }
                  Update: {
                    "buyer_bin"?: string | null,"buyer_name"?: string,"challan_number"?: string,"id"?: number,"issued_at"?: string,"seller_bin"?: string,"total_payable_bdt"?: number,"total_taxable_amount_bdt"?: number,"total_vat_bdt"?: number,"verification_seal_sha256"?: string
                  }
                  Relationships: [
                    
                  ]
                },"nightshift_digests": {
                  Row: {
                    "created_at": string,"cycle_timestamp": string,"date": string,"execution_duration_ms": number,"id": string,"markdown_report": string,"overall_health_score": number,"skills_executed": NonNullable<Json>,"status": string,"top_action_items": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"cycle_timestamp": string,"date": string,"execution_duration_ms"?: number,"id": string,"markdown_report"?: string,"overall_health_score"?: number,"skills_executed"?: NonNullable<Json>,"status"?: string,"top_action_items"?: NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"cycle_timestamp"?: string,"date"?: string,"execution_duration_ms"?: number,"id"?: string,"markdown_report"?: string,"overall_health_score"?: number,"skills_executed"?: NonNullable<Json>,"status"?: string,"top_action_items"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"nilkhet_orders": {
                  Row: {
                    "binding_type": string,"book_title": string,"copy_count": number,"courier_provider": string | null,"created_at": string,"id": number,"invoice_number": string,"metadata": Json | null,"page_count": number,"paper_type": string,"status": string,"total_price_bdt": string,"tracking_code": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "binding_type": string,"book_title": string,"copy_count": number,"courier_provider"?: string | null,"created_at"?: string,"id"?: number,"invoice_number": string,"metadata"?: Json | null,"page_count": number,"paper_type": string,"status"?: string,"total_price_bdt": string,"tracking_code"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "binding_type"?: string,"book_title"?: string,"copy_count"?: number,"courier_provider"?: string | null,"created_at"?: string,"id"?: number,"invoice_number"?: string,"metadata"?: Json | null,"page_count"?: number,"paper_type"?: string,"status"?: string,"total_price_bdt"?: string,"tracking_code"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"opc_tasks": {
                  Row: {
                    "assigned_agent": string | null,"company_id": string,"created_at": string,"description": string | null,"id": string,"metadata": NonNullable<Json>,"priority": string | null,"status": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_agent"?: string | null,"company_id"?: string,"created_at"?: string,"description"?: string | null,"id": string,"metadata"?: NonNullable<Json>,"priority"?: string | null,"status"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "assigned_agent"?: string | null,"company_id"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>,"priority"?: string | null,"status"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"organization_members": {
                  Row: {
                    "created_at": string,"id": string,"organization_id": string,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"organization_id": string,"role"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"organization_id"?: string,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "organization_members_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "created_at": string,"credits_pool": number,"id": string,"mfs_phone": string | null,"name": string,"owner_id": string,"slug": string,"tier": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"credits_pool"?: number,"id"?: string,"mfs_phone"?: string | null,"name": string,"owner_id": string,"slug": string,"tier"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"credits_pool"?: number,"id"?: string,"mfs_phone"?: string | null,"name"?: string,"owner_id"?: string,"slug"?: string,"tier"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"outcome_passes": {
                  Row: {
                    "category": string,"created_at": string,"credits_equivalent": number,"id": string,"is_active": boolean,"is_core": boolean,"name": string,"outcome": string,"price_bdt": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: string,"created_at"?: string,"credits_equivalent": number,"id": string,"is_active"?: boolean,"is_core"?: boolean,"name": string,"outcome": string,"price_bdt": number,"updated_at"?: string
                  }
                  Update: {
                    "category"?: string,"created_at"?: string,"credits_equivalent"?: number,"id"?: string,"is_active"?: boolean,"is_core"?: boolean,"name"?: string,"outcome"?: string,"price_bdt"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"parcels": {
                  Row: {
                    "address": string,"city": string,"cod_amount_bdt": number,"consignment_id": string,"created_at": string,"delivery_fee_bdt": number,"id": number,"metadata": NonNullable<Json>,"provider": string,"recipient_name": string,"recipient_phone": string,"status": string,"status_bangla": string,"timeline": NonNullable<Json>,"tracking_code": string,"updated_at": string,"user_id": string,"whatsapp_notification_sent": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "address": string,"city": string,"cod_amount_bdt"?: number,"consignment_id": string,"created_at"?: string,"delivery_fee_bdt"?: number,"id"?: number,"metadata"?: NonNullable<Json>,"provider"?: string,"recipient_name": string,"recipient_phone": string,"status"?: string,"status_bangla"?: string,"timeline"?: NonNullable<Json>,"tracking_code": string,"updated_at"?: string,"user_id"?: string,"whatsapp_notification_sent"?: boolean
                  }
                  Update: {
                    "address"?: string,"city"?: string,"cod_amount_bdt"?: number,"consignment_id"?: string,"created_at"?: string,"delivery_fee_bdt"?: number,"id"?: number,"metadata"?: NonNullable<Json>,"provider"?: string,"recipient_name"?: string,"recipient_phone"?: string,"status"?: string,"status_bangla"?: string,"timeline"?: NonNullable<Json>,"tracking_code"?: string,"updated_at"?: string,"user_id"?: string,"whatsapp_notification_sent"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"plagiarism_scans": {
                  Row: {
                    "audit_seal_sha256": string,"author_name": string,"document_title": string,"id": number,"scan_id": string,"scanned_at": string,"similarity_score_percent": number,"total_words": number,"ugc_compliant": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audit_seal_sha256": string,"author_name": string,"document_title": string,"id"?: number,"scan_id": string,"scanned_at"?: string,"similarity_score_percent": number,"total_words": number,"ugc_compliant"?: string
                  }
                  Update: {
                    "audit_seal_sha256"?: string,"author_name"?: string,"document_title"?: string,"id"?: number,"scan_id"?: string,"scanned_at"?: string,"similarity_score_percent"?: number,"total_words"?: number,"ugc_compliant"?: string
                  }
                  Relationships: [
                    
                  ]
                },"posts": {
                  Row: {
                    "agent_id": string | null,"author_id": string,"channel_id": string | null,"content": string | null,"content_url": string | null,"created_at": string | null,"downvotes": number | null,"id": string,"title": string,"upvotes": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "agent_id"?: string | null,"author_id": string,"channel_id"?: string | null,"content"?: string | null,"content_url"?: string | null,"created_at"?: string | null,"downvotes"?: number | null,"id"?: string,"title": string,"upvotes"?: number | null
                  }
                  Update: {
                    "agent_id"?: string | null,"author_id"?: string,"channel_id"?: string | null,"content"?: string | null,"content_url"?: string | null,"created_at"?: string | null,"downvotes"?: number | null,"id"?: string,"title"?: string,"upvotes"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_channel_id_fkey"
      columns: ["channel_id"]
isOneToOne: false
      referencedRelation: "channels"
      referencedColumns: ["id"]
    }
                  ]
                },"pricing_plans": {
                  Row: {
                    "billing_interval": string,"created_at": string,"features": NonNullable<Json>,"id": string,"is_active": boolean,"is_popular": boolean,"monthly_credits": number,"name": string,"name_bn": string | null,"price_bdt": number,"price_usd": number,"slug": string,"sort_order": number,"tagline": string | null,"tool_limits": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "billing_interval"?: string,"created_at"?: string,"features"?: NonNullable<Json>,"id": string,"is_active"?: boolean,"is_popular"?: boolean,"monthly_credits"?: number,"name": string,"name_bn"?: string | null,"price_bdt"?: number,"price_usd"?: number,"slug": string,"sort_order"?: number,"tagline"?: string | null,"tool_limits"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "billing_interval"?: string,"created_at"?: string,"features"?: NonNullable<Json>,"id"?: string,"is_active"?: boolean,"is_popular"?: boolean,"monthly_credits"?: number,"name"?: string,"name_bn"?: string | null,"price_bdt"?: number,"price_usd"?: number,"slug"?: string,"sort_order"?: number,"tagline"?: string | null,"tool_limits"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"projects": {
                  Row: {
                    "access_mode": string,"branch_name": string,"content": string,"created_at": string,"current_version": number | null,"description": string,"genre": string | null,"id": string,"lineage_root_id": string | null,"parent_project_id": string | null,"passcode_hash": string | null,"progress": number,"sections": NonNullable<Json>,"settings": NonNullable<Json>,"share_token": string | null,"starred": boolean,"template": string | null,"title": string,"type": string,"updated_at": string,"user_id": string,"word_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "access_mode"?: string,"branch_name"?: string,"content"?: string,"created_at"?: string,"current_version"?: number | null,"description"?: string,"genre"?: string | null,"id"?: string,"lineage_root_id"?: string | null,"parent_project_id"?: string | null,"passcode_hash"?: string | null,"progress"?: number,"sections"?: NonNullable<Json>,"settings"?: NonNullable<Json>,"share_token"?: string | null,"starred"?: boolean,"template"?: string | null,"title": string,"type"?: string,"updated_at"?: string,"user_id": string,"word_count"?: number
                  }
                  Update: {
                    "access_mode"?: string,"branch_name"?: string,"content"?: string,"created_at"?: string,"current_version"?: number | null,"description"?: string,"genre"?: string | null,"id"?: string,"lineage_root_id"?: string | null,"parent_project_id"?: string | null,"passcode_hash"?: string | null,"progress"?: number,"sections"?: NonNullable<Json>,"settings"?: NonNullable<Json>,"share_token"?: string | null,"starred"?: boolean,"template"?: string | null,"title"?: string,"type"?: string,"updated_at"?: string,"user_id"?: string,"word_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "projects_lineage_root_id_fkey"
      columns: ["lineage_root_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "projects_parent_project_id_fkey"
      columns: ["parent_project_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    }
                  ]
                },"protected_action_audit": {
                  Row: {
                    "action_id": string,"action_type": string,"actor_id": string,"approver_mfs_phone": string | null,"executed_at": string,"id": number,"otp_verified": string,"payload": NonNullable<Json>,"state_seal_sha256": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action_id": string,"action_type": string,"actor_id": string,"approver_mfs_phone"?: string | null,"executed_at"?: string,"id"?: number,"otp_verified"?: string,"payload": NonNullable<Json>,"state_seal_sha256": string
                  }
                  Update: {
                    "action_id"?: string,"action_type"?: string,"actor_id"?: string,"approver_mfs_phone"?: string | null,"executed_at"?: string,"id"?: number,"otp_verified"?: string,"payload"?: NonNullable<Json>,"state_seal_sha256"?: string
                  }
                  Relationships: [
                    
                  ]
                },"publishing_books": {
                  Row: {
                    "author_name": string | null,"category": string | null,"chapters": Json | null,"cover_dimensions": Json | null,"cover_preset": string | null,"cover_storage_id": string | null,"cover_url": string | null,"created_at": string,"credit_price": number | null,"currency": string,"current_run_id": string | null,"description": string | null,"genre": string | null,"google_play_url": string | null,"id": string,"isbn": string | null,"keywords": NonNullable<Json>,"language": string,"list_price": string | null,"manuscript_format": string | null,"manuscript_name": string | null,"manuscript_size": number | null,"manuscript_storage_id": string | null,"page_count": number | null,"project_id": string | null,"published_at": string | null,"rating": number | null,"rating_count": number | null,"rejection_category": string | null,"rejection_reason": string | null,"review_notes": string | null,"reviewer_name": string | null,"status": string,"subcategory": string | null,"subtitle": string | null,"synopsis": string | null,"target_word_count": number,"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_name"?: string | null,"category"?: string | null,"chapters"?: Json | null,"cover_dimensions"?: Json | null,"cover_preset"?: string | null,"cover_storage_id"?: string | null,"cover_url"?: string | null,"created_at"?: string,"credit_price"?: number | null,"currency"?: string,"current_run_id"?: string | null,"description"?: string | null,"genre"?: string | null,"google_play_url"?: string | null,"id"?: string,"isbn"?: string | null,"keywords"?: NonNullable<Json>,"language"?: string,"list_price"?: string | null,"manuscript_format"?: string | null,"manuscript_name"?: string | null,"manuscript_size"?: number | null,"manuscript_storage_id"?: string | null,"page_count"?: number | null,"project_id"?: string | null,"published_at"?: string | null,"rating"?: number | null,"rating_count"?: number | null,"rejection_category"?: string | null,"rejection_reason"?: string | null,"review_notes"?: string | null,"reviewer_name"?: string | null,"status"?: string,"subcategory"?: string | null,"subtitle"?: string | null,"synopsis"?: string | null,"target_word_count"?: number,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "author_name"?: string | null,"category"?: string | null,"chapters"?: Json | null,"cover_dimensions"?: Json | null,"cover_preset"?: string | null,"cover_storage_id"?: string | null,"cover_url"?: string | null,"created_at"?: string,"credit_price"?: number | null,"currency"?: string,"current_run_id"?: string | null,"description"?: string | null,"genre"?: string | null,"google_play_url"?: string | null,"id"?: string,"isbn"?: string | null,"keywords"?: NonNullable<Json>,"language"?: string,"list_price"?: string | null,"manuscript_format"?: string | null,"manuscript_name"?: string | null,"manuscript_size"?: number | null,"manuscript_storage_id"?: string | null,"page_count"?: number | null,"project_id"?: string | null,"published_at"?: string | null,"rating"?: number | null,"rating_count"?: number | null,"rejection_category"?: string | null,"rejection_reason"?: string | null,"review_notes"?: string | null,"reviewer_name"?: string | null,"status"?: string,"subcategory"?: string | null,"subtitle"?: string | null,"synopsis"?: string | null,"target_word_count"?: number,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rag_chunks": {
                  Row: {
                    "chunk_index": number,"content": string,"created_at": string,"doc_id": string,"embedding": NonNullable<Json>,"embedding_vec": string | null,"fts": unknown,"id": string,"metadata": NonNullable<Json>,"title": string,"tokens": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "chunk_index"?: number,"content": string,"created_at"?: string,"doc_id": string,"embedding"?: NonNullable<Json>,"embedding_vec"?: string | null,"fts"?: never,"id": string,"metadata"?: NonNullable<Json>,"title": string,"tokens"?: number,"user_id": string
                  }
                  Update: {
                    "chunk_index"?: number,"content"?: string,"created_at"?: string,"doc_id"?: string,"embedding"?: NonNullable<Json>,"embedding_vec"?: string | null,"fts"?: never,"id"?: string,"metadata"?: NonNullable<Json>,"title"?: string,"tokens"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rag_chunks_doc_id_fkey"
      columns: ["doc_id"]
isOneToOne: false
      referencedRelation: "rag_documents"
      referencedColumns: ["id"]
    }
                  ]
                },"rag_documents": {
                  Row: {
                    "chunk_count": number,"created_at": string,"id": string,"source_type": string,"source_url": string | null,"title": string,"total_length": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "chunk_count"?: number,"created_at"?: string,"id": string,"source_type"?: string,"source_url"?: string | null,"title": string,"total_length"?: number,"user_id": string
                  }
                  Update: {
                    "chunk_count"?: number,"created_at"?: string,"id"?: string,"source_type"?: string,"source_url"?: string | null,"title"?: string,"total_length"?: number,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"saga_executions": {
                  Row: {
                    "completed_at": string | null,"context": NonNullable<Json>,"correlation_id": string,"current_step_index": number,"error": string | null,"id": number,"idempotency_key": string | null,"saga_id": string,"saga_name": string,"started_at": string,"status": string,"steps": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string | null,"context"?: NonNullable<Json>,"correlation_id": string,"current_step_index"?: number,"error"?: string | null,"id"?: number,"idempotency_key"?: string | null,"saga_id": string,"saga_name": string,"started_at"?: string,"status": string,"steps"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "completed_at"?: string | null,"context"?: NonNullable<Json>,"correlation_id"?: string,"current_step_index"?: number,"error"?: string | null,"id"?: number,"idempotency_key"?: string | null,"saga_id"?: string,"saga_name"?: string,"started_at"?: string,"status"?: string,"steps"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"saved_reports": {
                  Row: {
                    "chat_id": string,"content": string,"created_at": string,"id": string,"metadata": NonNullable<Json>,"snippet": string,"title": string,"type": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "chat_id": string,"content"?: string,"created_at"?: string,"id": string,"metadata"?: NonNullable<Json>,"snippet"?: string,"title": string,"type"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "chat_id"?: string,"content"?: string,"created_at"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"snippet"?: string,"title"?: string,"type"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"second_me_key_custody": {
                  Row: {
                    "created_at": string,"id": number,"provider": string | null,"purpose": string,"sealed_key": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: number,"provider"?: string | null,"purpose": string,"sealed_key": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: number,"provider"?: string | null,"purpose"?: string,"sealed_key"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"second_me_writing_profiles": {
                  Row: {
                    "block_label": string,"created_at": string,"id": number,"last_content_length": number,"last_synced_at": string,"letta_agent_id": string,"model_handle": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "block_label"?: string,"created_at"?: string,"id"?: number,"last_content_length"?: number,"last_synced_at"?: string,"letta_agent_id": string,"model_handle"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "block_label"?: string,"created_at"?: string,"id"?: number,"last_content_length"?: number,"last_synced_at"?: string,"letta_agent_id"?: string,"model_handle"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"semantic_memories": {
                  Row: {
                    "category": string,"content": string,"created_at": string,"id": string,"keywords": NonNullable<Json>,"metadata": NonNullable<Json>,"relevance_score": number | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: string,"content": string,"created_at"?: string,"id": string,"keywords"?: NonNullable<Json>,"metadata"?: NonNullable<Json>,"relevance_score"?: number | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "category"?: string,"content"?: string,"created_at"?: string,"id"?: string,"keywords"?: NonNullable<Json>,"metadata"?: NonNullable<Json>,"relevance_score"?: number | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"semantic_memory_vectors": {
                  Row: {
                    "access_count": number,"category": string,"chunk_id": string | null,"confidence": number,"content": string,"created_at": string,"document_name": string | null,"embedding": NonNullable<Json>,"id": string,"keywords": NonNullable<Json>,"last_accessed_at": string,"metadata": Json | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "access_count"?: number,"category"?: string,"chunk_id"?: string | null,"confidence"?: number,"content": string,"created_at"?: string,"document_name"?: string | null,"embedding"?: NonNullable<Json>,"id": string,"keywords"?: NonNullable<Json>,"last_accessed_at"?: string,"metadata"?: Json | null,"user_id": string
                  }
                  Update: {
                    "access_count"?: number,"category"?: string,"chunk_id"?: string | null,"confidence"?: number,"content"?: string,"created_at"?: string,"document_name"?: string | null,"embedding"?: NonNullable<Json>,"id"?: string,"keywords"?: NonNullable<Json>,"last_accessed_at"?: string,"metadata"?: Json | null,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"tool_usage": {
                  Row: {
                    "cost_credits": number | null,"count": number,"created_at": string | null,"duration_ms": number | null,"id": number,"metadata": Json | null,"period_end": string | null,"period_start": string,"success": boolean | null,"tool": string,"tool_name": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cost_credits"?: number | null,"count"?: number,"created_at"?: string | null,"duration_ms"?: number | null,"id"?: number,"metadata"?: Json | null,"period_end"?: string | null,"period_start"?: string,"success"?: boolean | null,"tool": string,"tool_name"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "cost_credits"?: number | null,"count"?: number,"created_at"?: string | null,"duration_ms"?: number | null,"id"?: number,"metadata"?: Json | null,"period_end"?: string | null,"period_start"?: string,"success"?: boolean | null,"tool"?: string,"tool_name"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_activity_log": {
                  Row: {
                    "action": string,"id": number,"master_id": string | null,"metadata": NonNullable<Json>,"target_resource": string,"timestamp": string,"twin_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"id"?: number,"master_id"?: string | null,"metadata"?: NonNullable<Json>,"target_resource"?: string,"timestamp"?: string,"twin_id": string
                  }
                  Update: {
                    "action"?: string,"id"?: number,"master_id"?: string | null,"metadata"?: NonNullable<Json>,"target_resource"?: string,"timestamp"?: string,"twin_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_activity_logs": {
                  Row: {
                    "action": string,"created_at": string,"id": string,"master_id": string | null,"metadata": NonNullable<Json>,"target_resource": string,"twin_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"created_at"?: string,"id"?: string,"master_id"?: string | null,"metadata"?: NonNullable<Json>,"target_resource"?: string,"twin_id": string
                  }
                  Update: {
                    "action"?: string,"created_at"?: string,"id"?: string,"master_id"?: string | null,"metadata"?: NonNullable<Json>,"target_resource"?: string,"twin_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_approvals": {
                  Row: {
                    "action": string,"id": string,"master_id": string,"payload": NonNullable<Json>,"requested_at": string,"resolved_at": string | null,"status": string,"twin_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"id"?: string,"master_id": string,"payload"?: NonNullable<Json>,"requested_at"?: string,"resolved_at"?: string | null,"status"?: string,"twin_id": string
                  }
                  Update: {
                    "action"?: string,"id"?: string,"master_id"?: string,"payload"?: NonNullable<Json>,"requested_at"?: string,"resolved_at"?: string | null,"status"?: string,"twin_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_directions": {
                  Row: {
                    "company_slug": string,"content": string,"created_at": string,"id": string,"is_active": boolean,"kind": string,"supersedes_id": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "company_slug"?: string,"content": string,"created_at"?: string,"id": string,"is_active"?: boolean,"kind": string,"supersedes_id"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "company_slug"?: string,"content"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"kind"?: string,"supersedes_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_knowledge_vectors": {
                  Row: {
                    "content": string,"content_type": string,"created_at": string,"document_id": string,"id": string,"metadata": NonNullable<Json>,"title": string,"twin_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"content_type"?: string,"created_at"?: string,"document_id": string,"id"?: string,"metadata"?: NonNullable<Json>,"title": string,"twin_id": string
                  }
                  Update: {
                    "content"?: string,"content_type"?: string,"created_at"?: string,"document_id"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"title"?: string,"twin_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_pending_approvals": {
                  Row: {
                    "action": string,"id": number,"master_id": string,"payload": NonNullable<Json>,"requested_at": string,"resolved_at": string | null,"status": string,"twin_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"id"?: number,"master_id": string,"payload"?: NonNullable<Json>,"requested_at"?: string,"resolved_at"?: string | null,"status"?: string,"twin_id": string
                  }
                  Update: {
                    "action"?: string,"id"?: number,"master_id"?: string,"payload"?: NonNullable<Json>,"requested_at"?: string,"resolved_at"?: string | null,"status"?: string,"twin_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_profiles": {
                  Row: {
                    "allowed_skills": NonNullable<Json>,"api_key_hash": string | null,"api_key_prefix": string | null,"approval_required_actions": NonNullable<Json>,"bio": string | null,"blocked_skills": NonNullable<Json>,"communication_style": string | null,"created_at": string,"expertise_areas": NonNullable<Json>,"followers_count": number,"goals": NonNullable<Json>,"id": string,"is_active": boolean,"knowledge_score": number,"languages": NonNullable<Json>,"lifecycle_state": string,"master_id": string | null,"name": string,"persona": string | null,"published_count": number,"registration_token": string | null,"source_platform": string,"specialization": string | null,"task_count": number,"training_status": string,"trust_score": number,"updated_at": string,"verification_badge": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "allowed_skills"?: NonNullable<Json>,"api_key_hash"?: string | null,"api_key_prefix"?: string | null,"approval_required_actions"?: NonNullable<Json>,"bio"?: string | null,"blocked_skills"?: NonNullable<Json>,"communication_style"?: string | null,"created_at"?: string,"expertise_areas"?: NonNullable<Json>,"followers_count"?: number,"goals"?: NonNullable<Json>,"id"?: string,"is_active"?: boolean,"knowledge_score"?: number,"languages"?: NonNullable<Json>,"lifecycle_state"?: string,"master_id"?: string | null,"name": string,"persona"?: string | null,"published_count"?: number,"registration_token"?: string | null,"source_platform"?: string,"specialization"?: string | null,"task_count"?: number,"training_status"?: string,"trust_score"?: number,"updated_at"?: string,"verification_badge"?: boolean
                  }
                  Update: {
                    "allowed_skills"?: NonNullable<Json>,"api_key_hash"?: string | null,"api_key_prefix"?: string | null,"approval_required_actions"?: NonNullable<Json>,"bio"?: string | null,"blocked_skills"?: NonNullable<Json>,"communication_style"?: string | null,"created_at"?: string,"expertise_areas"?: NonNullable<Json>,"followers_count"?: number,"goals"?: NonNullable<Json>,"id"?: string,"is_active"?: boolean,"knowledge_score"?: number,"languages"?: NonNullable<Json>,"lifecycle_state"?: string,"master_id"?: string | null,"name"?: string,"persona"?: string | null,"published_count"?: number,"registration_token"?: string | null,"source_platform"?: string,"specialization"?: string | null,"task_count"?: number,"training_status"?: string,"trust_score"?: number,"updated_at"?: string,"verification_badge"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"twin_seeds": {
                  Row: {
                    "business_plan": string,"company_name": string,"conversation_id": string,"created_at": string,"id": number,"identity": string,"revision": number,"seed": Json | null,"summary": string,"tasks": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "business_plan"?: string,"company_name": string,"conversation_id": string,"created_at"?: string,"id"?: number,"identity": string,"revision"?: number,"seed"?: Json | null,"summary"?: string,"tasks"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "business_plan"?: string,"company_name"?: string,"conversation_id"?: string,"created_at"?: string,"id"?: number,"identity"?: string,"revision"?: number,"seed"?: Json | null,"summary"?: string,"tasks"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_task_memos": {
                  Row: {
                    "company_slug": string,"created_at": string,"execution_steps": NonNullable<Json>,"id": string,"invalidation_reason": string | null,"is_invalidated": boolean,"output_artifacts": NonNullable<Json>,"quality_score": number,"scope_path": string,"summary": string,"task_id": string,"title": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "company_slug"?: string,"created_at"?: string,"execution_steps"?: NonNullable<Json>,"id": string,"invalidation_reason"?: string | null,"is_invalidated"?: boolean,"output_artifacts"?: NonNullable<Json>,"quality_score"?: number,"scope_path"?: string,"summary": string,"task_id": string,"title": string,"user_id": string
                  }
                  Update: {
                    "company_slug"?: string,"created_at"?: string,"execution_steps"?: NonNullable<Json>,"id"?: string,"invalidation_reason"?: string | null,"is_invalidated"?: boolean,"output_artifacts"?: NonNullable<Json>,"quality_score"?: number,"scope_path"?: string,"summary"?: string,"task_id"?: string,"title"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"twin_tasks": {
                  Row: {
                    "completed_at": string | null,"created_at": string,"description": string | null,"id": string,"result": string | null,"status": string,"task_type": string,"title": string,"twin_id": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"result"?: string | null,"status"?: string,"task_type"?: string,"title": string,"twin_id"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "completed_at"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"result"?: string | null,"status"?: string,"task_type"?: string,"title"?: string,"twin_id"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"twins": {
                  Row: {
                    "allowed_skills": NonNullable<Json>,"api_key_hash": string | null,"api_key_prefix": string | null,"approval_required_actions": NonNullable<Json>,"bio": string,"blocked_skills": NonNullable<Json>,"communication_style": string,"created_at": string,"expertise_areas": NonNullable<Json>,"followers_count": number,"goals": NonNullable<Json>,"id": number,"is_active": boolean,"knowledge_score": number,"languages": NonNullable<Json>,"lifecycle_state": string,"master_id": string | null,"name": string,"persona": string,"published_count": number,"registration_token": string | null,"source_platform": string,"specialization": string,"task_count": number,"training_status": string,"trust_score": number,"updated_at": string,"verification_badge": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "allowed_skills"?: NonNullable<Json>,"api_key_hash"?: string | null,"api_key_prefix"?: string | null,"approval_required_actions"?: NonNullable<Json>,"bio"?: string,"blocked_skills"?: NonNullable<Json>,"communication_style"?: string,"created_at"?: string,"expertise_areas"?: NonNullable<Json>,"followers_count"?: number,"goals"?: NonNullable<Json>,"id"?: number,"is_active"?: boolean,"knowledge_score"?: number,"languages"?: NonNullable<Json>,"lifecycle_state"?: string,"master_id"?: string | null,"name": string,"persona"?: string,"published_count"?: number,"registration_token"?: string | null,"source_platform"?: string,"specialization"?: string,"task_count"?: number,"training_status"?: string,"trust_score"?: number,"updated_at"?: string,"verification_badge"?: boolean
                  }
                  Update: {
                    "allowed_skills"?: NonNullable<Json>,"api_key_hash"?: string | null,"api_key_prefix"?: string | null,"approval_required_actions"?: NonNullable<Json>,"bio"?: string,"blocked_skills"?: NonNullable<Json>,"communication_style"?: string,"created_at"?: string,"expertise_areas"?: NonNullable<Json>,"followers_count"?: number,"goals"?: NonNullable<Json>,"id"?: number,"is_active"?: boolean,"knowledge_score"?: number,"languages"?: NonNullable<Json>,"lifecycle_state"?: string,"master_id"?: string | null,"name"?: string,"persona"?: string,"published_count"?: number,"registration_token"?: string | null,"source_platform"?: string,"specialization"?: string,"task_count"?: number,"training_status"?: string,"trust_score"?: number,"updated_at"?: string,"verification_badge"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"user_connectors": {
                  Row: {
                    "connected": boolean,"connector_id": string,"created_at": string,"encrypted_credentials": string | null,"endpoint_url": string | null,"id": string,"items_indexed": number,"last_synced_at": string | null,"last_verified_at": string | null,"masked_key": string | null,"metadata": NonNullable<Json>,"status": string,"sync_summary": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "connected"?: boolean,"connector_id": string,"created_at"?: string,"encrypted_credentials"?: string | null,"endpoint_url"?: string | null,"id"?: string,"items_indexed"?: number,"last_synced_at"?: string | null,"last_verified_at"?: string | null,"masked_key"?: string | null,"metadata"?: NonNullable<Json>,"status"?: string,"sync_summary"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "connected"?: boolean,"connector_id"?: string,"created_at"?: string,"encrypted_credentials"?: string | null,"endpoint_url"?: string | null,"id"?: string,"items_indexed"?: number,"last_synced_at"?: string | null,"last_verified_at"?: string | null,"masked_key"?: string | null,"metadata"?: NonNullable<Json>,"status"?: string,"sync_summary"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_credits": {
                  Row: {
                    "balance": number,"lifetime_earned": number,"lifetime_spent": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "balance"?: number,"lifetime_earned"?: number,"lifetime_spent"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "balance"?: number,"lifetime_earned"?: number,"lifetime_spent"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_preferences": {
                  Row: {
                    "locale": string,"notifications": NonNullable<Json>,"studio_mode": string,"tax_profile": NonNullable<Json>,"theme": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "locale"?: string,"notifications"?: NonNullable<Json>,"studio_mode"?: string,"tax_profile"?: NonNullable<Json>,"theme"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "locale"?: string,"notifications"?: NonNullable<Json>,"studio_mode"?: string,"tax_profile"?: NonNullable<Json>,"theme"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_profiles": {
                  Row: {
                    "auth_provider": string,"country": string,"created_at": string,"credits": number,"email": string,"id": string,"name": string,"password_hash": string | null,"role": string,"tier": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "auth_provider"?: string,"country"?: string,"created_at"?: string,"credits"?: number,"email": string,"id": string,"name": string,"password_hash"?: string | null,"role"?: string,"tier"?: string,"updated_at"?: string
                  }
                  Update: {
                    "auth_provider"?: string,"country"?: string,"created_at"?: string,"credits"?: number,"email"?: string,"id"?: string,"name"?: string,"password_hash"?: string | null,"role"?: string,"tier"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_subscriptions": {
                  Row: {
                    "cancel_at_period_end": boolean,"created_at": string,"current_period_end": string | null,"id": number,"interval": string,"status": string,"stripe_customer_id": string | null,"stripe_subscription_id": string | null,"tier": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cancel_at_period_end"?: boolean,"created_at"?: string,"current_period_end"?: string | null,"id"?: number,"interval"?: string,"status"?: string,"stripe_customer_id"?: string | null,"stripe_subscription_id"?: string | null,"tier"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "cancel_at_period_end"?: boolean,"created_at"?: string,"current_period_end"?: string | null,"id"?: number,"interval"?: string,"status"?: string,"stripe_customer_id"?: string | null,"stripe_subscription_id"?: string | null,"tier"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"votes": {
                  Row: {
                    "created_at": string | null,"entity_id": string,"entity_type": string,"id": string,"user_id": string,"vote_type": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"entity_id": string,"entity_type": string,"id"?: string,"user_id": string,"vote_type": number
                  }
                  Update: {
                    "created_at"?: string | null,"entity_id"?: string,"entity_type"?: string,"id"?: string,"user_id"?: string,"vote_type"?: number
                  }
                  Relationships: [
                    
                  ]
                },"workspaces": {
                  Row: {
                    "created_at": string,"created_by": string,"description": string | null,"id": string,"is_private": boolean,"name": string,"organization_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by": string,"description"?: string | null,"id"?: string,"is_private"?: boolean,"name": string,"organization_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string,"description"?: string | null,"id"?: string,"is_private"?: boolean,"name"?: string,"organization_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "workspaces_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"writing_autosave": {
                  Row: {
                    "content": string,"id": number,"local_project_id": string,"saved_at": string,"user_id": string,"word_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: string,"id"?: number,"local_project_id": string,"saved_at"?: string,"user_id": string,"word_count"?: number
                  }
                  Update: {
                    "content"?: string,"id"?: number,"local_project_id"?: string,"saved_at"?: string,"user_id"?: string,"word_count"?: number
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "deduct_user_credits":
{ Args: { "p_amount": number,"p_user_id": string }; Returns: {
              "lifetime_spent": number,"new_balance": number,"success": boolean,"user_id": string
            }[]
                           },
"get_auth_role":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"get_hot_posts":
{ Args: Record<PropertyKey, never>; Returns: {
              "agent_id": string | null,
"author_id": string,
"channel_id": string | null,
"content": string | null,
"content_url": string | null,
"created_at": string | null,
"downvotes": number | null,
"id": string,
"title": string,
"upvotes": number | null
            }[]
                          SetofOptions: {
        from: "*"
        to: "posts"
        isOneToOne: false
        isSetofReturn: true
      } },
"get_my_vault_secret":
{ Args: { "secret_name": string }; Returns: string
                           },
"get_platform_domain_stats":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"hybrid_search_rag_chunks":
{ Args: { "p_match_count"?: number,"p_query_embedding": string,"p_query_text": string,"p_rrf_k"?: number,"p_user_id": string }; Returns: {
              "chunk_index": number,"content": string,"doc_id": string,"id": string,"keyword_score": number,"metadata": Json,"rrf_score": number,"title": string,"tokens": number,"user_id": string,"vector_score": number
            }[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
